import { useState } from "react";
import { Activity, AlertTriangle, FileDiff, ListChecks, Terminal as TerminalIcon } from "lucide-react";

import type { AgentEvent, ProjectFile } from "@/lib/nexus/queries";

const KIND_ICON: Record<string, string> = {
  file: "✏️",
  terminal: "▶",
  git: "⑂",
  browser: "🌐",
  roblox: "🧱",
  search: "🔎",
  ai: "🧠",
  image: "🖼",
  extension: "🧩",
};

const TABS = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "changes", label: "Changes", icon: FileDiff },
  { id: "plan", label: "Plan", icon: ListChecks },
  { id: "problems", label: "Problems", icon: AlertTriangle },
  { id: "output", label: "Output", icon: TerminalIcon },
] as const;

export function AgentPanel({
  events,
  changedFiles,
  output,
}: {
  events: AgentEvent[];
  changedFiles: ProjectFile[];
  output: string[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("activity");

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div className="flex items-center gap-px border-b border-sidebar-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`mono-xs flex items-center gap-1.5 px-2.5 py-2 uppercase tracking-wider transition-colors ${
              tab === t.id ? "border-b border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="size-3" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin">
        {tab === "activity" && (
          events.length === 0 ? (
            <Empty text="No agent activity yet. Send a task and every step shows up here." />
          ) : (
            <ol className="space-y-2">
              {[...events].reverse().map((e) => (
                <li key={e.id} className="rounded border border-sidebar-border bg-surface/60 p-2">
                  <div className="flex items-baseline gap-2">
                    <span className="mono-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className="text-xs">{KIND_ICON[e.kind] ?? "•"}</span>
                    <span className="flex-1 text-xs text-foreground/90">{e.label}</span>
                    {e.status === "running" && <span className="mono-xs text-warning">running</span>}
                  </div>
                  {Object.keys(e.detail ?? {}).length > 0 && (
                    <pre className="mono-xs mt-1.5 max-h-24 overflow-auto whitespace-pre-wrap text-muted-foreground scrollbar-thin">
                      {JSON.stringify(e.detail, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          )
        )}

        {tab === "changes" && (
          changedFiles.length === 0 ? (
            <Empty text="No pending changes. File edits made by the agent are listed here with a diff." />
          ) : (
            <ul className="space-y-1.5">
              {changedFiles.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded border border-sidebar-border bg-surface/60 px-2 py-1.5">
                  <span className="mono-xs truncate">{f.path}</span>
                  <span className="mono-xs text-muted-foreground">{new Date(f.updated_at).toLocaleTimeString([], { hour12: false })}</span>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === "plan" && (
          (() => {
            const plan = [...events].reverse().find((e) => e.label.toLowerCase().includes("plan"));
            return plan ? (
              <div className="space-y-2">
                <p className="mono-xs uppercase tracking-widest text-muted-foreground">Latest plan event</p>
                <p className="text-xs text-foreground/90">{plan.label}</p>
                <pre className="mono-xs whitespace-pre-wrap text-muted-foreground">{JSON.stringify(plan.detail, null, 2)}</pre>
              </div>
            ) : (
              <Empty text="No plan yet. Switch the chat to Plan mode and describe the goal." />
            );
          })()
        )}

        {tab === "problems" && <Empty text="No problems detected in this workspace." />}

        {tab === "output" && (
          output.length === 0 ? (
            <Empty text="Terminal output from agent commands appears here." />
          ) : (
            <pre className="mono-xs whitespace-pre-wrap text-foreground/80">{output.join("\n")}</pre>
          )
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-1 py-6 text-xs leading-relaxed text-muted-foreground">{text}</p>;
}
