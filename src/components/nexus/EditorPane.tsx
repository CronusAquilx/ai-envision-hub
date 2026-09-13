import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { guessLanguage } from "@/lib/nexus/queries";

const Monaco = lazy(() => import("@monaco-editor/react"));

export interface OpenTab {
  id: string;
  path: string;
  content: string;
  dirty: boolean;
}

export function EditorPane({
  tabs,
  activeId,
  onActivate,
  onClose,
  onChange,
  onSave,
}: {
  tabs: OpenTab[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onSave: (id: string) => void;
}) {
  const active = tabs.find((t) => t.id === activeId) ?? null;

  if (!active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">No file open.</p>
        <p className="text-xs text-muted-foreground">Pick a file in the Explorer, or ask the agent to create one.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-px overflow-x-auto border-b border-border bg-surface scrollbar-thin">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`group flex shrink-0 items-center gap-2 border-r border-border px-3 py-2 text-xs ${
              t.id === activeId ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <button onClick={() => onActivate(t.id)} className="mono-xs">
              {t.path.split("/").pop()}
              {t.dirty && <span className="ml-1 text-primary">●</span>}
            </button>
            <button onClick={() => onClose(t.id)} aria-label={`Close ${t.path}`}>
              <X className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
            </button>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 px-2">
          <span className="mono-xs hidden text-muted-foreground sm:block">{active.path}</span>
          <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs" onClick={() => onSave(active.id)} disabled={!active.dirty}>
            <Save className="size-3" /> Save
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ClientOnly fallback={<div className="p-4 mono-xs text-muted-foreground">Loading editor…</div>}>
          <Suspense fallback={<div className="p-4 mono-xs text-muted-foreground">Loading editor…</div>}>
            <Monaco
              height="100%"
              theme="vs-dark"
              language={guessLanguage(active.path)}
              path={active.path}
              value={active.content}
              onChange={(value) => onChange(active.id, value ?? "")}
              options={{
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                fontSize: 13,
                minimap: { enabled: true },
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                folding: true,
                tabSize: 2,
                automaticLayout: true,
                renderWhitespace: "selection",
                padding: { top: 12 },
              }}
            />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}
