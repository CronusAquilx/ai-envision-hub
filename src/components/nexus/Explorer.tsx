import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, File, FilePlus, FolderPlus, Pencil, Trash2 } from "lucide-react";

import type { ProjectFile } from "@/lib/nexus/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Node {
  name: string;
  path: string;
  file?: ProjectFile;
  children: Node[];
}

function buildTree(files: ProjectFile[]): Node {
  const root: Node = { name: "", path: "", children: [] };
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let cursor = root;
    parts.forEach((part, i) => {
      const path = parts.slice(0, i + 1).join("/");
      let next = cursor.children.find((c) => c.name === part);
      if (!next) {
        next = { name: part, path, children: [] };
        cursor.children.push(next);
      }
      if (i === parts.length - 1) next.file = file;
      cursor = next;
    });
  }
  const sort = (node: Node) => {
    node.children.sort((a, b) => {
      const aDir = a.children.length > 0 || a.file?.is_dir;
      const bDir = b.children.length > 0 || b.file?.is_dir;
      if (aDir !== bDir) return aDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sort);
  };
  sort(root);
  return root;
}

export function Explorer({
  files,
  activePath,
  onOpen,
  onCreate,
  onRename,
  onDelete,
}: {
  files: ProjectFile[];
  activePath: string | null;
  onOpen: (file: ProjectFile) => void;
  onCreate: (path: string, isDir: boolean) => void;
  onRename: (file: ProjectFile, path: string) => void;
  onDelete: (file: ProjectFile) => void;
}) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<{ isDir: boolean; value: string } | null>(null);
  const [filter, setFilter] = useState("");

  const visible = filter
    ? buildTree(files.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase())))
    : tree;

  function renderNode(node: Node, depth: number) {
    const isDir = node.children.length > 0 || node.file?.is_dir;
    const open = !collapsed[node.path];
    return (
      <div key={node.path}>
        <div
          className={`group flex items-center gap-1 rounded-sm px-2 py-[3px] text-xs hover:bg-sidebar-accent ${
            activePath === node.path ? "bg-sidebar-accent text-foreground" : "text-foreground/80"
          }`}
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <button
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
            onClick={() => {
              if (isDir) setCollapsed((c) => ({ ...c, [node.path]: open }));
              else if (node.file) onOpen(node.file);
            }}
          >
            {isDir ? (
              open ? <ChevronDown className="size-3 shrink-0 opacity-60" /> : <ChevronRight className="size-3 shrink-0 opacity-60" />
            ) : (
              <File className="size-3 shrink-0 opacity-60" />
            )}
            <span className="mono-xs truncate">{node.name}</span>
          </button>
          {node.file && (
            <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                aria-label="Rename"
                onClick={() => {
                  const next = window.prompt("New path", node.file!.path);
                  if (next && next !== node.file!.path) onRename(node.file!, next);
                }}
              >
                <Pencil className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
              <button aria-label="Delete" onClick={() => onDelete(node.file!)}>
                <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
              </button>
            </span>
          )}
        </div>
        {isDir && open && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-sidebar-border px-2 py-1.5">
        <span className="mono-xs uppercase tracking-widest text-muted-foreground">Explorer</span>
        <span className="flex gap-0.5">
          <Button size="icon" variant="ghost" className="size-6" aria-label="New file" onClick={() => setDraft({ isDir: false, value: "" })}>
            <FilePlus className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-6" aria-label="New folder" onClick={() => setDraft({ isDir: true, value: "" })}>
            <FolderPlus className="size-3.5" />
          </Button>
        </span>
      </div>
      <div className="border-b border-sidebar-border p-2">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter files" className="h-7 text-xs" />
      </div>
      {draft && (
        <form
          className="border-b border-sidebar-border p-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.value.trim()) onCreate(draft.value.trim(), draft.isDir);
            setDraft(null);
          }}
        >
          <Input
            autoFocus
            value={draft.value}
            onChange={(e) => setDraft({ ...draft, value: e.target.value })}
            placeholder={draft.isDir ? "src/server" : "src/server/Service.luau"}
            className="h-7 text-xs"
            onBlur={() => setDraft(null)}
          />
        </form>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto py-1 scrollbar-thin">
        {files.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">This workspace is empty.</p>
            <Button size="sm" variant="outline" className="mt-3 h-7 text-xs" onClick={() => setDraft({ isDir: false, value: "" })}>
              Create a file
            </Button>
          </div>
        ) : (
          visible.children.map((child) => renderNode(child, 0))
        )}
      </div>
    </div>
  );
}
