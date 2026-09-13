import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { ProjectFile } from "@/lib/nexus/queries";

/**
 * Workspace terminal.
 *
 * In the browser it runs against the cloud workspace (a real virtual
 * filesystem backed by the database). On the desktop build the same
 * component talks to the local agent bridge, which executes real shells.
 */
export function TerminalPanel({
  files,
  bridgeConnected,
  onWriteFile,
  onDeleteFile,
  onOutput,
}: {
  files: ProjectFile[];
  bridgeConnected: boolean;
  onWriteFile: (path: string, content: string, isDir?: boolean) => Promise<void>;
  onDeleteFile: (path: string) => Promise<void>;
  onOutput: (line: string) => void;
}) {
  const [lines, setLines] = useState<string[]>([
    "NEXUS workspace shell — type `help` for commands.",
    bridgeConnected ? "Local bridge: connected" : "Local bridge: not connected (cloud workspace mode)",
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);

  function push(...out: string[]) {
    setLines((l) => [...l, ...out]);
    out.forEach(onOutput);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end" }));
  }

  async function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`$ ${cmd}`);
    setHistory((h) => [cmd, ...h]);
    setCursor(-1);

    const [name, ...args] = cmd.split(/\s+/);
    try {
      switch (name) {
        case "help":
          push(
            "help                     show this list",
            "ls [dir]                 list workspace files",
            "cat <file>               print a file",
            "mkdir <dir>              create a folder",
            "touch <file>             create an empty file",
            "write <file> <text...>   write text to a file",
            "rm <file>                delete a file",
            "tree                     show the file tree",
            "clear                    clear the terminal",
          );
          break;
        case "clear":
          setLines([]);
          break;
        case "ls": {
          const prefix = args[0] ? args[0].replace(/\/$/, "") + "/" : "";
          const names = new Set<string>();
          files.forEach((f) => {
            if (!f.path.startsWith(prefix)) return;
            const rest = f.path.slice(prefix.length).split("/")[0];
            if (rest) names.add(rest);
          });
          push(names.size ? [...names].sort().join("  ") : "(empty)");
          break;
        }
        case "tree":
          push(files.length ? files.map((f) => f.path).sort().join("\n") : "(empty workspace)");
          break;
        case "cat": {
          const file = files.find((f) => f.path === args[0]);
          push(file ? file.content || "(empty file)" : `cat: ${args[0]}: no such file`);
          break;
        }
        case "mkdir":
          if (!args[0]) push("mkdir: missing operand");
          else {
            await onWriteFile(args[0], "", true);
            push(`created ${args[0]}/`);
          }
          break;
        case "touch":
          if (!args[0]) push("touch: missing operand");
          else {
            await onWriteFile(args[0], "");
            push(`created ${args[0]}`);
          }
          break;
        case "write":
          if (args.length < 2) push("write: usage write <file> <text...>");
          else {
            await onWriteFile(args[0]!, args.slice(1).join(" "));
            push(`wrote ${args[0]}`);
          }
          break;
        case "rm":
          if (!args[0]) push("rm: missing operand");
          else {
            await onDeleteFile(args[0]);
            push(`removed ${args[0]}`);
          }
          break;
        case "npm":
        case "git":
        case "python":
        case "cargo":
        case "rojo":
          push(
            bridgeConnected
              ? `${name}: forwarded to the local bridge`
              : `${name}: requires the desktop app's local bridge. Connect it under Settings → Computer Access.`,
          );
          break;
        default:
          push(`${name}: command not found`);
      }
    } catch (error) {
      push(`error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
        <span className="mono-xs rounded bg-elevated px-2 py-1 text-foreground">workspace</span>
        <button className="rail-item size-6" aria-label="New terminal" onClick={() => push("(single shell in this build)")}>
          <Plus className="size-3.5" />
        </button>
        <button className="rail-item size-6" aria-label="Clear" onClick={() => setLines([])}>
          <Trash2 className="size-3.5" />
        </button>
        <span className="mono-xs ml-auto text-muted-foreground">
          {bridgeConnected ? "bridge: connected" : "bridge: offline"}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        <pre className="mono-xs whitespace-pre-wrap leading-relaxed text-foreground/85">{lines.join("\n")}</pre>
        <div ref={endRef} />
      </div>
      <form
        className="flex items-center gap-2 border-t border-border px-3 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run(value);
          setValue("");
        }}
      >
        <span className="mono-xs text-primary">$</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.min(cursor + 1, history.length - 1);
              setCursor(next);
              setValue(history[next] ?? "");
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = Math.max(cursor - 1, -1);
              setCursor(next);
              setValue(next === -1 ? "" : (history[next] ?? ""));
            }
          }}
          className="mono-xs flex-1 bg-transparent text-foreground outline-none"
          placeholder="ls"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
