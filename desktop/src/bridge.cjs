/**
 * NEXUS AI local bridge.
 *
 * A loopback-only RPC server. It is the ONLY component that touches the real
 * machine: files, shells, git, Rojo/Roblox and MCP servers. The web app and the
 * desktop renderer both talk to it over http://127.0.0.1:17872/rpc with a
 * per-install token.
 *
 * Security rules enforced here:
 *  - binds 127.0.0.1 only
 *  - every request needs the bridge token (except /health and CORS preflight)
 *  - every path is resolved and must stay inside a granted folder
 *  - destructive shell commands are rejected unless the caller marks them approved
 */
const http = require("node:http");
const fsp = require("node:fs/promises");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { exec } = require("node:child_process");

const PORT = 17872;
const HOST = "127.0.0.1";
const STATE_DIR = path.join(os.homedir(), ".nexus-ai");
const STATE_FILE = path.join(STATE_DIR, "bridge.json");
const MAX_READ = 2 * 1024 * 1024;
const DESTRUCTIVE = /(^|\s)(rm\s+-rf|del\s+\/|format\s|mkfs|shutdown|diskpart|git\s+push\s+--force|:\(\)\{)/i;

let state = { token: crypto.randomBytes(24).toString("hex"), grants: [] };

function loadState() {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    if (fs.existsSync(STATE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      state = { token: parsed.token || state.token, grants: parsed.grants || [] };
    }
    saveState();
  } catch {
    /* fall back to in-memory state */
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
  } catch {
    /* ignore */
  }
}

/* ------------------------------ grants ------------------------------ */

function normalise(p) {
  return path.resolve(p.replace(/^~(?=$|[/\\])/, os.homedir()));
}

function isGranted(target) {
  const abs = normalise(target);
  return state.grants.some((g) => {
    const root = normalise(g);
    return abs === root || abs.startsWith(root + path.sep);
  });
}

/** Resolve `root` + `rel` and refuse anything outside a granted folder. */
function safePath(root, rel = "") {
  if (!root) throw new Error("No folder given. Grant a folder first.");
  const abs = normalise(path.join(normalise(root), rel));
  if (!isGranted(abs)) throw new Error(`Access to ${abs} has not been granted.`);
  return abs;
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "target", "__pycache__", ".venv"]);

async function walk(dir, base, out, depth = 0) {
  if (depth > 12 || out.length > 8000) return out;
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") continue;
    const abs = path.join(dir, entry.name);
    const rel = path.relative(base, abs).split(path.sep).join("/");
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(rel + "/");
      await walk(abs, base, out, depth + 1);
    } else {
      out.push(rel);
    }
  }
  return out;
}

function run(command, cwd) {
  return new Promise((resolve) => {
    exec(command, { cwd, maxBuffer: 8 * 1024 * 1024, windowsHide: true, timeout: 180_000 }, (error, stdout, stderr) => {
      resolve({ code: error && typeof error.code === "number" ? error.code : error ? 1 : 0, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

function which(binary) {
  const cmd = process.platform === "win32" ? `where ${binary}` : `command -v ${binary}`;
  try {
    require("node:child_process").execSync(cmd, { stdio: "ignore", windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

function studioPluginPath() {
  if (process.platform === "win32") return path.join(os.homedir(), "AppData", "Local", "Roblox", "Plugins");
  return path.join(os.homedir(), "Documents", "Roblox", "Plugins");
}

/* ------------------------------ methods ----------------------------- */

const methods = {
  async health() {
    return {
      ok: true,
      version: "1.0.0",
      platform: process.platform,
      shells: process.platform === "win32" ? ["powershell", "cmd"] : ["bash", "zsh", "sh"],
      grants: state.grants,
      roblox: { rojo: which("rojo"), plugin: fs.existsSync(studioPluginPath()) },
    };
  },

  async "grants.list"() {
    return { grants: state.grants };
  },
  async "grants.add"({ path: target }) {
    const abs = normalise(String(target));
    const stat = await fsp.stat(abs);
    if (!stat.isDirectory()) throw new Error("Grants must be folders.");
    if (!state.grants.includes(abs)) state.grants.push(abs);
    saveState();
    return { grants: state.grants };
  },
  async "grants.remove"({ path: target }) {
    const abs = normalise(String(target));
    state.grants = state.grants.filter((g) => normalise(g) !== abs);
    saveState();
    return { grants: state.grants };
  },

  async "fs.list"({ root }) {
    const base = safePath(root);
    return { paths: await walk(base, base, []) };
  },
  async "fs.read"({ root, path: rel }) {
    const abs = safePath(root, rel);
    const stat = await fsp.stat(abs);
    if (stat.size > MAX_READ) throw new Error("File is too large to read.");
    return { content: await fsp.readFile(abs, "utf8") };
  },
  async "fs.write"({ root, path: rel, content }) {
    const abs = safePath(root, rel);
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, String(content ?? ""), "utf8");
    return { ok: true, path: abs };
  },
  async "fs.delete"({ root, path: rel }) {
    const abs = safePath(root, rel);
    await fsp.rm(abs, { recursive: true, force: true });
    return { ok: true };
  },
  async "fs.rename"({ root, path: rel, to }) {
    const from = safePath(root, rel);
    const dest = safePath(root, to);
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.rename(from, dest);
    return { ok: true };
  },
  async "fs.search"({ root, query }) {
    const base = safePath(root);
    const paths = await walk(base, base, []);
    const needle = String(query ?? "");
    const matches = [];
    for (const rel of paths) {
      if (rel.endsWith("/")) continue;
      if (rel.includes(needle)) matches.push(rel);
      if (matches.length > 400) break;
      try {
        const abs = path.join(base, rel);
        if ((await fsp.stat(abs)).size > 512 * 1024) continue;
        const text = await fsp.readFile(abs, "utf8");
        const line = text.split("\n").findIndex((l) => l.includes(needle));
        if (line >= 0) matches.push(`${rel}:${line + 1}`);
      } catch {
        /* binary or unreadable */
      }
    }
    return { matches };
  },

  async "terminal.exec"({ root, command, cwd, approved }) {
    const base = safePath(root);
    const workdir = cwd ? safePath(root, cwd) : base;
    const cmd = String(command ?? "");
    if (DESTRUCTIVE.test(cmd) && !approved) throw new Error("This command is destructive and needs explicit approval.");
    return run(cmd, workdir);
  },
  async "terminal.kill"({ pid }) {
    process.kill(Number(pid));
    return { ok: true };
  },

  async "git.status"({ root }) {
    const out = await run("git status --short --branch", safePath(root));
    return { output: (out.stdout + out.stderr).trim() || "clean" };
  },
  async "git.diff"({ root, path: rel }) {
    const out = await run(`git diff${rel ? ` -- ${JSON.stringify(rel)}` : ""}`, safePath(root));
    return { output: (out.stdout + out.stderr).trim() || "no changes" };
  },
  async "git.commit"({ root, message }) {
    const base = safePath(root);
    if (!message) throw new Error("A commit message is required.");
    await run("git add -A", base);
    const out = await run(`git commit -m ${JSON.stringify(String(message))}`, base);
    return { output: (out.stdout + out.stderr).trim() };
  },
  async "git.branches"({ root }) {
    const out = await run("git branch -vv", safePath(root));
    return { output: (out.stdout + out.stderr).trim() };
  },
  async "git.checkout"({ root, branch }) {
    const out = await run(`git checkout ${JSON.stringify(String(branch))}`, safePath(root));
    return { output: (out.stdout + out.stderr).trim() };
  },
  async "git.log"({ root }) {
    const out = await run("git log --oneline -20", safePath(root));
    return { output: (out.stdout + out.stderr).trim() };
  },

  async "roblox.status"({ root }) {
    const base = safePath(root);
    return {
      rojo: which("rojo"),
      plugin: fs.existsSync(studioPluginPath()),
      project: fs.existsSync(path.join(base, "default.project.json")) || fs.existsSync(path.join(base, "project.json")),
    };
  },
  async "roblox.sync"({ root }) {
    const base = safePath(root);
    if (!which("rojo")) throw new Error("Rojo is not installed on this machine.");
    const project = fs.existsSync(path.join(base, "default.project.json")) ? "default.project.json" : "project.json";
    const out = await run(`rojo build ${project} -o nexus-sync.rbxlx`, base);
    return { output: (out.stdout + out.stderr).trim() || "built nexus-sync.rbxlx" };
  },
  async "roblox.inspect"({ root, path: rel }) {
    const base = safePath(root);
    if (rel) return { output: await fsp.readFile(safePath(root, rel), "utf8") };
    const paths = await walk(base, base, []);
    return { output: paths.filter((p) => /\.(lua|luau|project\.json)$/i.test(p) || p.endsWith("/")).join("\n") };
  },

  async "mcp.call"({ server, tool, input }) {
    const entry = (state.mcp || {})[server];
    if (!entry) throw new Error(`MCP server "${server}" is not configured in the desktop app.`);
    const out = await run(`${entry.command} ${JSON.stringify(JSON.stringify({ tool, input: input ?? {} }))}`, entry.cwd || os.homedir());
    return { output: (out.stdout + out.stderr).trim() };
  },

  async "os.reveal"({ root, path: rel }) {
    const abs = safePath(root, rel);
    const cmd = process.platform === "win32" ? `explorer /select,"${abs}"` : process.platform === "darwin" ? `open -R "${abs}"` : `xdg-open "${path.dirname(abs)}"`;
    await run(cmd, path.dirname(abs));
    return { ok: true };
  },
};

/* ------------------------------ server ------------------------------ */

function cors(res, origin) {
  res.setHeader("access-control-allow-origin", origin || "*");
  res.setHeader("access-control-allow-headers", "content-type,x-nexus-bridge-token");
  res.setHeader("access-control-allow-methods", "POST,GET,OPTIONS");
  res.setHeader("vary", "origin");
}

function createBridgeServer() {
  loadState();
  const server = http.createServer((req, res) => {
    cors(res, req.headers.origin);
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      methods.health().then((r) => res.end(JSON.stringify({ ok: true, result: r })));
      return;
    }
    if (req.method !== "POST" || req.url !== "/rpc") {
      res.writeHead(404).end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12 * 1024 * 1024) req.destroy();
    });
    req.on("end", async () => {
      res.setHeader("content-type", "application/json");
      try {
        const { method, params } = JSON.parse(body || "{}");
        const handler = methods[method];
        if (!handler) throw new Error(`Unknown bridge method: ${method}`);
        if (method !== "health" && req.headers["x-nexus-bridge-token"] !== state.token) {
          res.writeHead(401).end(JSON.stringify({ ok: false, error: "Invalid bridge token. Pair the web app from the desktop window." }));
          return;
        }
        const result = await handler(params || {});
        res.writeHead(200).end(JSON.stringify({ ok: true, result }));
      } catch (error) {
        res.writeHead(200).end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
      }
    });
  });

  server.listen(PORT, HOST);
  return server;
}

module.exports = { createBridgeServer, getToken: () => state.token, getGrants: () => state.grants, methods, loadState };

if (require.main === module) {
  createBridgeServer();
  loadState();
  console.log(`NEXUS bridge listening on http://${HOST}:${PORT}`);
  console.log(`token: ${state.token}`);
}
