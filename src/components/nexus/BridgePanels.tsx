import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bridgeRpc, type BridgeHealth } from "@/lib/nexus/bridge";
import { EXTENSION_CATALOGUE, EXTENSION_CATEGORIES } from "@/lib/nexus/extensions";
import {
  installExtension,
  listInstalledExtensions,
  setExtensionEnabled,
  uninstallExtension,
} from "@/lib/nexus/workspace";

function Offline({ what }: { what: string }) {
  return (
    <div className="p-3 text-xs leading-relaxed text-muted-foreground">
      <p>{what} needs the desktop app, which hosts the local bridge on this computer.</p>
      <Link to="/download" className="mono-xs mt-3 block text-accent hover:underline">
        Get the desktop app →
      </Link>
    </div>
  );
}

/* ------------------------------- Git ------------------------------- */

export function GitPanel({
  connected,
  rootPath,
  tier,
}: {
  connected: boolean;
  rootPath: string | null;
  tier: string;
}) {
  const [message, setMessage] = useState("");
  const enabled = connected && !!rootPath;

  const status = useQuery({
    queryKey: ["git-status", rootPath],
    queryFn: () => bridgeRpc<{ output: string }>("git.status", { root: rootPath }),
    enabled,
    refetchInterval: 20_000,
  });
  const branches = useQuery({
    queryKey: ["git-branches", rootPath],
    queryFn: () => bridgeRpc<{ output: string }>("git.branches", { root: rootPath }),
    enabled,
  });
  const log = useQuery({
    queryKey: ["git-log", rootPath],
    queryFn: () => bridgeRpc<{ output: string }>("git.log", { root: rootPath }),
    enabled,
  });

  if (!enabled) return <Offline what="Git" />;

  async function suggestMessage() {
    try {
      const diff = await bridgeRpc<{ output: string }>("git.diff", { root: rootPath });
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tier,
          goal: "Write a single-line conventional commit message for this diff. Reply with the message only.",
          history: [{ role: "user", content: diff.output.slice(0, 6000) }],
          planOnly: true,
        }),
      });
      const json = (await res.json()) as { thought?: string; summary?: string };
      const text = (json.summary ?? json.thought ?? "").split("\n")[0]?.replace(/^["']|["']$/g, "");
      if (text) setMessage(text);
      else toast.info("No message suggested — write one yourself");
    } catch {
      toast.error("Could not read the diff");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-2 py-1.5">
        <span className="mono-xs uppercase tracking-widest text-muted-foreground">Git</span>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2 scrollbar-thin">
        <section>
          <p className="mono-xs uppercase tracking-widest text-muted-foreground">Status</p>
          <pre className="mono-xs mt-1 whitespace-pre-wrap text-foreground/85">{status.data?.output ?? "…"}</pre>
        </section>
        <section className="space-y-1.5">
          <p className="mono-xs uppercase tracking-widest text-muted-foreground">Commit</p>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Commit message" className="h-7 text-xs" />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="h-6 text-xs"
              onClick={() =>
                void bridgeRpc("git.commit", { root: rootPath, message })
                  .then(() => {
                    setMessage("");
                    toast.success("Committed");
                    void status.refetch();
                    void log.refetch();
                  })
                  .catch((e: Error) => toast.error(e.message))
              }
            >
              Commit
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => void suggestMessage()}>
              Suggest
            </Button>
          </div>
        </section>
        <section>
          <p className="mono-xs uppercase tracking-widest text-muted-foreground">Branches</p>
          <pre className="mono-xs mt-1 whitespace-pre-wrap text-foreground/85">{branches.data?.output ?? "…"}</pre>
        </section>
        <section>
          <p className="mono-xs uppercase tracking-widest text-muted-foreground">History</p>
          <pre className="mono-xs mt-1 whitespace-pre-wrap text-muted-foreground">{log.data?.output ?? "…"}</pre>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ Roblox ----------------------------- */

export function RobloxPanel({
  health,
  rootPath,
  detectedRoblox,
}: {
  health: BridgeHealth | null;
  rootPath: string | null;
  detectedRoblox: boolean;
}) {
  const [tree, setTree] = useState<string>("");
  const connected = !!health && !!rootPath;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-2 py-1.5">
        <span className="mono-xs uppercase tracking-widest text-muted-foreground">Roblox Studio</span>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2 text-xs scrollbar-thin">
        <p className="flex items-center gap-2">
          <span className={connected ? "text-success" : "text-destructive"}>●</span>
          {connected ? "Bridge connected" : "Bridge offline"}
        </p>
        <ul className="mono-xs space-y-1 text-muted-foreground">
          <li>Rojo project file: {detectedRoblox ? "detected" : "not detected"}</li>
          <li>Rojo binary: {health?.roblox.rojo ? "available" : "not found"}</li>
          <li>Studio plugin: {health?.roblox.plugin ? "installed" : "not installed"}</li>
          <li>Sync folder: {rootPath ?? "cloud workspace"}</li>
        </ul>
        {connected ? (
          <>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-6 text-xs"
                onClick={() =>
                  void bridgeRpc<{ output: string }>("roblox.sync", { root: rootPath })
                    .then((r) => setTree(r.output))
                    .catch((e: Error) => toast.error(e.message))
                }
              >
                Sync to Studio
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs"
                onClick={() =>
                  void bridgeRpc<{ output: string }>("roblox.inspect", { root: rootPath })
                    .then((r) => setTree(r.output))
                    .catch((e: Error) => toast.error(e.message))
                }
              >
                Inspect tree
              </Button>
            </div>
            <pre className="mono-xs whitespace-pre-wrap text-foreground/85">{tree || "Run a sync or inspect to see Studio output."}</pre>
          </>
        ) : (
          <Offline what="Studio access (Rojo, the plugin and the MCP bridge)" />
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Extensions --------------------------- */

export function ExtensionsPanel() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("all");
  const installed = useQuery({ queryKey: ["installed-extensions"], queryFn: listInstalledExtensions });

  const list = EXTENSION_CATALOGUE.filter((e) => category === "all" || e.category === category);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-2 py-1.5">
        <span className="mono-xs uppercase tracking-widest text-muted-foreground">Extensions</span>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-sidebar-border p-2">
        {["all", ...EXTENSION_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`mono-xs rounded px-1.5 py-0.5 ${category === c ? "bg-sidebar-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-sidebar-border overflow-y-auto scrollbar-thin">
        {list.map((ext) => {
          const row = installed.data?.find((i) => i.extension_id === ext.id);
          return (
            <li key={ext.id} className="p-2">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">{ext.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{ext.name}</p>
                  <p className="mono-xs text-muted-foreground">
                    {ext.author} · v{ext.version}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ext.description}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    {row ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() =>
                            void setExtensionEnabled(row.id, !row.is_enabled).then(() =>
                              queryClient.invalidateQueries({ queryKey: ["installed-extensions"] }),
                            )
                          }
                        >
                          {row.is_enabled ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() =>
                            void uninstallExtension(row.id).then(() =>
                              queryClient.invalidateQueries({ queryKey: ["installed-extensions"] }),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          void installExtension(ext.id)
                            .then(() => {
                              toast.success(`${ext.name} installed`);
                              void queryClient.invalidateQueries({ queryKey: ["installed-extensions"] });
                            })
                            .catch(() => toast.error("Could not install"))
                        }
                      >
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
