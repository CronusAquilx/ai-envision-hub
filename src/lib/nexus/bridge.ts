/**
 * Local bridge client.
 *
 * The desktop app (see /desktop) runs a small RPC server on the loopback
 * interface. It is the only thing that can touch the real filesystem, a real
 * shell, git or Roblox Studio. The web app talks to it over HTTP when it is
 * running; otherwise every tool falls back to the cloud workspace.
 */

export const BRIDGE_URL = "http://127.0.0.1:17872";
const TOKEN_KEY = "nexus.bridge.token";

export type BridgeMethod =
  | "health"
  | "grants.list"
  | "grants.add"
  | "grants.remove"
  | "fs.list"
  | "fs.read"
  | "fs.write"
  | "fs.delete"
  | "fs.rename"
  | "fs.search"
  | "terminal.exec"
  | "terminal.kill"
  | "git.status"
  | "git.diff"
  | "git.commit"
  | "git.branches"
  | "git.checkout"
  | "git.log"
  | "roblox.status"
  | "roblox.sync"
  | "roblox.inspect"
  | "mcp.call"
  | "os.reveal";

export interface BridgeHealth {
  ok: true;
  version: string;
  platform: string;
  shells: string[];
  grants: string[];
  roblox: { rojo: boolean; plugin: boolean };
}

export function bridgeToken() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setBridgeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export class BridgeUnavailable extends Error {
  constructor() {
    super("The local bridge is not running. Install and open the NEXUS desktop app to give the agent access to this computer.");
    this.name = "BridgeUnavailable";
  }
}

export async function bridgeRpc<T = unknown>(method: BridgeMethod, params: Record<string, unknown> = {}, timeoutMs = 120_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BRIDGE_URL}/rpc`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(bridgeToken() ? { "x-nexus-bridge-token": bridgeToken()! } : {}),
      },
      body: JSON.stringify({ method, params }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error((await res.text()) || `bridge ${method} failed`);
    const json = (await res.json()) as { ok: boolean; result?: T; error?: string };
    if (!json.ok) throw new Error(json.error || `bridge ${method} failed`);
    return json.result as T;
  } catch (error) {
    if (error instanceof DOMException || (error instanceof TypeError && /fetch/i.test(error.message))) {
      throw new BridgeUnavailable();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeBridge(): Promise<BridgeHealth | null> {
  try {
    return await bridgeRpc<BridgeHealth>("health", {}, 2500);
  } catch {
    return null;
  }
}
