import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FolderOpen, MessageSquarePlus, Plus, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wordmark } from "@/components/nexus/Logo";
import { useSession } from "@/lib/nexus/session";
import { createChat, createProject, listChats, listProjects, writeFile } from "@/lib/nexus/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const TEMPLATES: Record<string, { path: string; content: string }[]> = {
  empty: [{ path: "README.md", content: "# New project\n" }],
  react: [
    { path: "package.json", content: '{\n  "name": "app",\n  "private": true\n}\n' },
    { path: "src/App.tsx", content: "export default function App() {\n  return <h1>Hello</h1>;\n}\n" },
    { path: "src/main.tsx", content: "// entry point\n" },
  ],
  python: [
    { path: "pyproject.toml", content: "[project]\nname = \"app\"\nversion = \"0.1.0\"\n" },
    { path: "src/main.py", content: 'def main() -> None:\n    print("hello")\n' },
  ],
  node: [
    { path: "package.json", content: '{\n  "name": "service",\n  "type": "module"\n}\n' },
    { path: "src/index.js", content: "console.log('service up');\n" },
  ],
  roblox: [
    { path: "default.project.json", content: '{\n  "name": "Game",\n  "tree": { "$className": "DataModel" }\n}\n' },
    { path: "src/server/InventoryService.luau", content: "--!strict\nlocal InventoryService = {}\n\nreturn InventoryService\n" },
    { path: "src/client/InventoryController.luau", content: "--!strict\nlocal InventoryController = {}\n\nreturn InventoryController\n" },
    { path: "src/shared/InventoryTypes.luau", content: "--!strict\nexport type Item = { id: string, amount: number }\nreturn {}\n" },
  ],
  fivem: [
    { path: "fxmanifest.lua", content: "fx_version 'cerulean'\ngame 'gta5'\n\nclient_script 'client/main.lua'\nserver_script 'server/main.lua'\n" },
    { path: "client/main.lua", content: "-- client entry\n" },
    { path: "server/main.lua", content: "-- server entry\n" },
  ],
};

function Dashboard() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("empty");
  const [busy, setBusy] = useState(false);

  const projects = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const chats = useQuery({ queryKey: ["chats", "recent"], queryFn: () => listChats() });

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const project = await createProject({ name: name.trim(), project_type: type });
      for (const file of TEMPLATES[type] ?? TEMPLATES.empty!) {
        await writeFile(project.id, file.path, file.content);
      }
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      navigate({ to: "/workspace/$projectId", params: { projectId: project.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the project");
    } finally {
      setBusy(false);
    }
  }

  async function newChat() {
    const chat = await createChat({});
    const project = projects.data?.[0];
    if (project) navigate({ to: "/workspace/$projectId", params: { projectId: project.id }, search: { chat: chat.id } });
    else toast.info("Create a project first — chats live inside a workspace.");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Link to="/settings"><Button variant="ghost" size="sm"><Settings2 className="size-4" /> Settings</Button></Link>
            <Button variant="ghost" size="sm" onClick={() => void signOut().then(() => navigate({ to: "/auth" }))}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Open a workspace, or start a new task.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4" /> New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pname">Project name</Label>
                  <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Roblox FPS" />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty">Empty</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="node">Node service</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="roblox">Roblox (Rojo)</SelectItem>
                      <SelectItem value="fivem">FiveM resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => void create()} disabled={busy || !name.trim()}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => void newChat()}><MessageSquarePlus className="size-4" /> New Chat</Button>
          <Link to="/download"><Button variant="outline"><Download className="size-4" /> Desktop app</Button></Link>
        </div>

        <section className="mt-10">
          <h2 className="mono-xs uppercase tracking-widest text-muted-foreground">Projects</h2>
          {projects.data?.length ? (
            <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {projects.data.map((p) => (
                <Link
                  key={p.id}
                  to="/workspace/$projectId"
                  params={{ projectId: p.id }}
                  className="bg-surface p-4 transition-colors hover:bg-elevated"
                >
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="mono-xs mt-1 text-muted-foreground">{p.project_type}</p>
                  <p className="mono-xs mt-3 text-muted-foreground">
                    updated {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-border bg-surface p-8 text-center">
              <FolderOpen className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No projects yet. Create one to start building.</p>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mono-xs uppercase tracking-widest text-muted-foreground">Recent chats</h2>
          {chats.data?.length ? (
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {chats.data.slice(0, 8).map((c) => (
                <li key={c.id}>
                  {c.project_id ? (
                    <Link
                      to="/workspace/$projectId"
                      params={{ projectId: c.project_id }}
                      search={{ chat: c.id }}
                      className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-elevated"
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="mono-xs text-muted-foreground">{c.mode} · {c.model}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground">
                      <span className="truncate">{c.title}</span>
                      <span className="mono-xs">no project</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              No chats yet. Everything you send is saved to your account.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
