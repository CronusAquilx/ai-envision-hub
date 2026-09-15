import { useEffect, useMemo, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface PaletteCommand {
  id: string;
  title: string;
  group: string;
  shortcut?: string;
  run: () => void;
}

/** Ctrl/Cmd+Shift+P command palette and Ctrl/Cmd+P quick open. */
export function CommandPalette({
  commands,
  files,
  onOpenFile,
}: {
  commands: PaletteCommand[];
  files: { id: string; path: string; is_dir: boolean }[];
  onOpenFile: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setQuick(false);
        setOpen(true);
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setQuick(true);
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, PaletteCommand[]>();
    commands.forEach((c) => map.set(c.group, [...(map.get(c.group) ?? []), c]));
    return [...map.entries()];
  }, [commands]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={quick ? "Search files by name…" : "Type a command…"} />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        {quick
          ? (
              <CommandGroup heading="Files">
                {files
                  .filter((f) => !f.is_dir)
                  .slice(0, 200)
                  .map((f) => (
                    <CommandItem
                      key={f.id}
                      value={f.path}
                      onSelect={() => {
                        onOpenFile(f.id);
                        setOpen(false);
                      }}
                    >
                      <span className="mono-xs">{f.path}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )
          : groups.map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`${c.title} ${group}`}
                    onSelect={() => {
                      c.run();
                      setOpen(false);
                    }}
                  >
                    <span>{c.title}</span>
                    {c.shortcut && <span className="mono-xs ml-auto text-muted-foreground">{c.shortcut}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
      </CommandList>
    </CommandDialog>
  );
}
