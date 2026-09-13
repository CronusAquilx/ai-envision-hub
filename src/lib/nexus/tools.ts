/**
 * Tool layer.
 *
 * Every capability the agent has goes through here, so permissions, activity
 * logging and the choice between the cloud workspace and the real machine
 * (via the desktop bridge) are enforced in exactly one place.
 */
import { bridgeRpc, BridgeUnavailable } from "./bridge";
import { checkTool, type Permissions } from "./permissions";
import type { PendingChange } from "./diff";
import { deleteFile, listFiles, renameFile, writeFile, type ProjectFile } from "./queries";

export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  ok: boolean;
  output: string;
}

export interface ToolContext {
  projectId: string;
  /** Real folder on the user's machine, when the bridge is connected. */
  rootPath: string | null;
  bridgeConnected: boolean;
  permissions: Permissions;
  getFiles: () => Promise<ProjectFile[]>;
  refresh: () => Promise<void>;
  log: (event: { kind: string; label: string; status?: string; detail?: Record<string, unknown> }) => Promise<void>;
  /** Returns true when the user approves a guarded action. */
  confirm: (reason: string) => Promise<boolean>;
  recordChange: (change: PendingChange) => void;
}

export const TOOL_SPECS: { name: string; args: string; description: string }[] = [
  { name: "project.tree", args: "{}", description: "List every file path in the workspace." },
  { name: "filesystem.read", args: '{ "path": string }', description: "Read one file." },
  { name: "filesystem.write", args: '{ "path": string, "content": string }', description: "Create or overwrite a file with its full new content." },
  { name: "filesystem.delete", args: '{ "path": string }', description: "Delete a file (destructive)." },
  { name: "filesystem.rename", args: '{ "path": string, "to": string }', description: "Rename or move a file (destructive)." },
  { name: "filesystem.search", args: '{ "query": string }', description: "Search file paths and contents." },
  { name: "terminal.execute", args: '{ "command": string, "cwd"?: string }', description: "Run a shell command on the user's machine (desktop bridge only)." },
  { name: "git.status", args: "{}", description: "Git status of the project folder." },
  { name: "git.diff", args: '{ "path"?: string }', description: "Git diff." },
  { name: "git.commit", args: '{ "message": string }', description: "Stage everything and commit." },
  { name: "web.search", args: '{ "query": string }', description: "Research the web and return findings with sources." },
  { name: "roblox.inspect", args: '{ "path"?: string }', description: "Inspect the Studio instance tree or a script." },
  { name: "roblox.sync", args: "{}", description: "Sync the workspace into Studio through Rojo or the plugin." },
  { name: "mcp.call", args: '{ "server": string, "tool": string, "input"?: object }', description: "Call a connected MCP tool." },
];

export function toolCatalogueForPrompt() {
  return TOOL_SPECS.map((t) => `- ${t.name} ${t.args} — ${t.description}`).join("\n");
}

function bridgeAvailable(ctx: ToolContext) {
  return ctx.bridgeConnected && !!ctx.rootPath;
}

export async function executeTool(ctx: ToolContext, call: ToolCall): Promise<ToolResult> {
  const verdict = checkTool(ctx.permissions, call.tool, call.args);
  if (!verdict.allow) {
    if (!verdict.confirm) {
      await ctx.log({ kind: "ai", label: `${call.tool} blocked`, status: "blocked", detail: { reason: verdict.reason } });
      return { ok: false, output: `Blocked: ${verdict.reason}` };
    }
    const approved = await ctx.confirm(verdict.reason);
    if (!approved) {
      await ctx.log({ kind: "ai", label: `${call.tool} declined by user`, status: "blocked", detail: call.args });
      return { ok: false, output: "The user declined this action." };
    }
  }

  const kind = call.tool.split(".")[0] ?? "ai";
  await ctx.log({ kind: kind === "filesystem" ? "file" : kind === "web" ? "search" : kind, label: `${call.tool} ${describeArgs(call)}`, status: "running", detail: call.args });

  try {
    const result = await dispatch(ctx, call);
    await ctx.log({
      kind: kind === "filesystem" ? "file" : kind === "web" ? "search" : kind,
      label: `${call.tool} ${describeArgs(call)} · ${result.ok ? "completed" : "failed"}`,
      status: result.ok ? "done" : "error",
      detail: { output: result.output.slice(0, 800) },
    });
    return result;
  } catch (error) {
    const message = error instanceof BridgeUnavailable ? error.message : error instanceof Error ? error.message : String(error);
    await ctx.log({ kind: "ai", label: `${call.tool} failed`, status: "error", detail: { message } });
    return { ok: false, output: message };
  }
}

function describeArgs(call: ToolCall) {
  const a = call.args;
  return String(a["path"] ?? a["command"] ?? a["query"] ?? a["message"] ?? a["tool"] ?? "").slice(0, 90);
}

async function dispatch(ctx: ToolContext, call: ToolCall): Promise<ToolResult> {
  const path = String(call.args["path"] ?? "");
  switch (call.tool) {
    case "project.tree": {
      if (bridgeAvailable(ctx)) {
        const out = await bridgeRpc<{ paths: string[] }>("fs.list", { root: ctx.rootPath, recursive: true });
        return { ok: true, output: out.paths.join("\n") || "(empty)" };
      }
      const files = await ctx.getFiles();
      return { ok: true, output: files.map((f) => (f.is_dir ? `${f.path}/` : f.path)).join("\n") || "(empty workspace)" };
    }

    case "filesystem.read": {
      if (bridgeAvailable(ctx)) {
        const out = await bridgeRpc<{ content: string }>("fs.read", { root: ctx.rootPath, path });
        return { ok: true, output: out.content };
      }
      const files = await ctx.getFiles();
      const file = files.find((f) => f.path === path);
      if (!file) return { ok: false, output: `No such file: ${path}` };
      return { ok: true, output: file.content || "(empty file)" };
    }

    case "filesystem.write": {
      const content = String(call.args["content"] ?? "");
      const files = await ctx.getFiles();
      const existing = files.find((f) => f.path === path);
      if (bridgeAvailable(ctx)) {
        await bridgeRpc("fs.write", { root: ctx.rootPath, path, content });
      } else {
        await writeFile(ctx.projectId, path, content);
      }
      ctx.recordChange({
        id: `${path}:${Date.now()}`,
        path,
        before: existing?.content ?? "",
        after: content,
        created: !existing,
        deleted: false,
        origin: "agent",
        at: new Date().toISOString(),
      });
      await ctx.refresh();
      return { ok: true, output: `${existing ? "Updated" : "Created"} ${path} (${content.split("\n").length} lines)` };
    }

    case "filesystem.delete": {
      const files = await ctx.getFiles();
      const file = files.find((f) => f.path === path);
      if (bridgeAvailable(ctx)) {
        await bridgeRpc("fs.delete", { root: ctx.rootPath, path });
      } else {
        if (!file) return { ok: false, output: `No such file: ${path}` };
        await deleteFile(file.id);
      }
      ctx.recordChange({
        id: `${path}:${Date.now()}`,
        path,
        before: file?.content ?? "",
        after: "",
        created: false,
        deleted: true,
        origin: "agent",
        at: new Date().toISOString(),
      });
      await ctx.refresh();
      return { ok: true, output: `Deleted ${path}` };
    }

    case "filesystem.rename": {
      const to = String(call.args["to"] ?? "");
      if (bridgeAvailable(ctx)) {
        await bridgeRpc("fs.rename", { root: ctx.rootPath, path, to });
      } else {
        const files = await ctx.getFiles();
        const file = files.find((f) => f.path === path);
        if (!file) return { ok: false, output: `No such file: ${path}` };
        await renameFile(file.id, to);
      }
      await ctx.refresh();
      return { ok: true, output: `Renamed ${path} → ${to}` };
    }

    case "filesystem.search": {
      const query = String(call.args["query"] ?? "");
      if (bridgeAvailable(ctx)) {
        const out = await bridgeRpc<{ matches: string[] }>("fs.search", { root: ctx.rootPath, query });
        return { ok: true, output: out.matches.join("\n") || "no matches" };
      }
      const files = await ctx.getFiles();
      const hits = files
        .filter((f) => !f.is_dir && (f.path.includes(query) || f.content.includes(query)))
        .map((f) => {
          const line = f.content.split("\n").findIndex((l) => l.includes(query));
          return line >= 0 ? `${f.path}:${line + 1}` : f.path;
        });
      return { ok: true, output: hits.join("\n") || "no matches" };
    }

    case "terminal.execute": {
      const command = String(call.args["command"] ?? "");
      if (!bridgeAvailable(ctx)) {
        return {
          ok: false,
          output:
            "No shell available. This workspace is running in the cloud. Open the NEXUS desktop app and grant access to the project folder to run real commands.",
        };
      }
      const out = await bridgeRpc<{ code: number; stdout: string; stderr: string }>("terminal.exec", {
        root: ctx.rootPath,
        command,
        cwd: call.args["cwd"] ?? null,
      });
      const text = [out.stdout, out.stderr].filter(Boolean).join("\n").slice(0, 8000);
      return { ok: out.code === 0, output: `exit ${out.code}\n${text}` };
    }

    case "git.status":
    case "git.diff":
    case "git.commit": {
      if (!bridgeAvailable(ctx)) return { ok: false, output: "Git needs the desktop app connected to a real repository folder." };
      const method = call.tool === "git.status" ? "git.status" : call.tool === "git.diff" ? "git.diff" : "git.commit";
      const out = await bridgeRpc<{ output: string }>(method, { root: ctx.rootPath, path: call.args["path"] ?? null, message: call.args["message"] ?? null });
      return { ok: true, output: out.output };
    }

    case "web.search": {
      const query = String(call.args["query"] ?? "");
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) return { ok: false, output: await res.text() };
      const json = (await res.json()) as { text: string };
      return { ok: true, output: json.text };
    }

    case "roblox.inspect":
    case "roblox.sync": {
      if (!bridgeAvailable(ctx)) {
        return { ok: false, output: "Roblox Studio access runs through the desktop bridge (Rojo, the Studio plugin or MCP). It is not connected." };
      }
      const out = await bridgeRpc<{ output: string }>(call.tool === "roblox.sync" ? "roblox.sync" : "roblox.inspect", {
        root: ctx.rootPath,
        path: call.args["path"] ?? null,
      });
      return { ok: true, output: out.output };
    }

    case "mcp.call": {
      if (!bridgeAvailable(ctx)) return { ok: false, output: "MCP tools are hosted by the desktop bridge, which is not connected." };
      const out = await bridgeRpc<{ output: string }>("mcp.call", {
        server: call.args["server"],
        tool: call.args["tool"],
        input: call.args["input"] ?? {},
      });
      return { ok: true, output: out.output };
    }

    default:
      return { ok: false, output: `Unknown tool: ${call.tool}` };
  }
}

/** Snapshot helper: the full current workspace, for rollback. */
export async function captureWorkspace(projectId: string) {
  const files = await listFiles(projectId);
  return files.map((f) => ({ path: f.path, content: f.content, is_dir: f.is_dir }));
}
