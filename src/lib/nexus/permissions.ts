/** Tool permission model shared by the agent loop, the terminal and the UI. */

export type FilePolicy = "ask-always" | "ask-destructive" | "allow" | "restricted";
export type TerminalPolicy = "ask-always" | "ask-destructive" | "allow" | "off";
export type Autonomy = "manual" | "assisted" | "autonomous" | "full";

export interface Permissions {
  files: FilePolicy;
  terminal: TerminalPolicy;
  browser: boolean;
  git: boolean;
  roblox: boolean;
  mcp: boolean;
  autonomy: Autonomy;
  maxIterations: number;
  askWhenBlocked: boolean;
}

export const DEFAULT_PERMISSIONS: Permissions = {
  files: "ask-destructive",
  terminal: "ask-always",
  browser: true,
  git: true,
  roblox: true,
  mcp: true,
  autonomy: "assisted",
  maxIterations: 12,
  askWhenBlocked: true,
};

export function readPermissions(settings: Record<string, unknown> | undefined): Permissions {
  const raw = (settings?.["permissions"] ?? {}) as Partial<Permissions>;
  const agent = (settings?.["agent"] ?? {}) as Partial<Permissions>;
  return { ...DEFAULT_PERMISSIONS, ...agent, ...raw };
}

const DESTRUCTIVE_FILE = new Set(["filesystem.delete", "filesystem.rename"]);
const DESTRUCTIVE_CMD = /(^|\s)(rm\s+-rf|del\s+\/|format|drop\s+database|shutdown|mkfs|git\s+push\s+--force|:\(\)\{)/i;

export type Verdict = { allow: true } | { allow: false; confirm: true; reason: string } | { allow: false; confirm: false; reason: string };

export function checkTool(perms: Permissions, tool: string, args: Record<string, unknown>): Verdict {
  if (tool.startsWith("filesystem.")) {
    const destructive = DESTRUCTIVE_FILE.has(tool);
    const writes = destructive || tool === "filesystem.write";
    if (!writes) return { allow: true };
    if (perms.files === "restricted") return { allow: false, confirm: false, reason: "File modification is restricted in settings." };
    if (perms.files === "allow") return { allow: true };
    if (perms.files === "ask-destructive" && !destructive) return { allow: true };
    return { allow: false, confirm: true, reason: `Approve ${tool} on ${String(args["path"] ?? "workspace")}?` };
  }
  if (tool.startsWith("terminal.")) {
    if (perms.terminal === "off") return { allow: false, confirm: false, reason: "Terminal execution is turned off in settings." };
    const cmd = String(args["command"] ?? "");
    if (perms.terminal === "allow") return { allow: true };
    if (perms.terminal === "ask-destructive" && !DESTRUCTIVE_CMD.test(cmd)) return { allow: true };
    return { allow: false, confirm: true, reason: `Run \`${cmd}\`?` };
  }
  if (tool.startsWith("git.")) {
    if (!perms.git) return { allow: false, confirm: false, reason: "Git access is turned off." };
    if (tool === "git.commit" || tool === "git.checkout") return { allow: false, confirm: true, reason: `Approve ${tool}?` };
    return { allow: true };
  }
  if (tool.startsWith("browser.") || tool.startsWith("web.")) {
    return perms.browser ? { allow: true } : { allow: false, confirm: false, reason: "Browser and web access is turned off." };
  }
  if (tool.startsWith("roblox.")) {
    return perms.roblox ? { allow: true } : { allow: false, confirm: false, reason: "Roblox access is turned off." };
  }
  if (tool.startsWith("mcp.")) {
    return perms.mcp ? { allow: true } : { allow: false, confirm: false, reason: "MCP tools are turned off." };
  }
  return { allow: true };
}
