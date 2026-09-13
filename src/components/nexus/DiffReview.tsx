import { useState } from "react";
import { Check, FileDiff, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { diffLines, diffStat, type PendingChange } from "@/lib/nexus/diff";

/** Per-change Accept / Reject / Open, plus Review All Changes. */
export function DiffReview({
  changes,
  onAccept,
  onReject,
  onOpen,
}: {
  changes: PendingChange[];
  onAccept: (change: PendingChange) => void;
  onReject: (change: PendingChange) => void;
  onOpen: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(changes[0]?.id ?? null);

  if (changes.length === 0) {
    return (
      <p className="px-1 py-6 text-xs leading-relaxed text-muted-foreground">
        No pending changes. Every file the agent writes lands here as a diff you can accept or reject.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Button size="sm" className="h-6 text-xs" onClick={() => changes.forEach(onAccept)}>
          Accept all
        </Button>
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => changes.forEach(onReject)}>
          Reject all
        </Button>
        <span className="mono-xs ml-auto text-muted-foreground">{changes.length} files</span>
      </div>

      {changes.map((change) => {
        const rows = diffLines(change.before, change.after);
        const stat = diffStat(rows);
        const open = expanded === change.id;
        return (
          <div key={change.id} className="rounded border border-border bg-surface/60">
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <button className="mono-xs flex min-w-0 flex-1 items-center gap-1.5 truncate text-left" onClick={() => setExpanded(open ? null : change.id)}>
                <FileDiff className="size-3 shrink-0 text-primary" />
                <span className="truncate">{change.path}</span>
                <span className="text-success">+{stat.added}</span>
                <span className="text-destructive">−{stat.removed}</span>
                {change.created && <span className="text-muted-foreground">new</span>}
                {change.deleted && <span className="text-destructive">deleted</span>}
              </button>
              <button className="mono-xs text-muted-foreground hover:text-foreground" onClick={() => onOpen(change.path)}>
                open
              </button>
              <button aria-label="Accept" onClick={() => onAccept(change)}>
                <Check className="size-3.5 text-success" />
              </button>
              <button aria-label="Reject" onClick={() => onReject(change)}>
                <X className="size-3.5 text-destructive" />
              </button>
            </div>
            {open && (
              <pre className="mono-xs max-h-72 overflow-auto border-t border-border px-2 py-1.5 scrollbar-thin">
                {rows.slice(0, 400).map((r, i) => (
                  <div
                    key={i}
                    className={
                      r.kind === "add"
                        ? "bg-success/10 text-success"
                        : r.kind === "del"
                          ? "bg-destructive/10 text-destructive"
                          : "text-muted-foreground"
                    }
                  >
                    {r.kind === "add" ? "+" : r.kind === "del" ? "−" : " "} {r.text}
                  </div>
                ))}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
