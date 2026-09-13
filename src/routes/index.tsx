import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  Boxes,
  Braces,
  Download,
  FolderTree,
  GitBranch,
  Globe,
  Image as ImageIcon,
  ListChecks,
  Puzzle,
  Terminal,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/nexus/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS AI — Your AI Development Environment" },
      {
        name: "description",
        content:
          "Build software, websites, games and Roblox projects with an autonomous AI developer that reads your files, plans, edits code, runs tools and reports back.",
      },
      { property: "og:title", content: "NEXUS AI — Your AI Development Environment" },
      { property: "og:description", content: "An autonomous AI developer that works inside your projects." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Bot, title: "Agent Mode", body: "Inspects the workspace, plans, edits files, runs commands, tests and iterates until the task is verified." },
  { icon: ListChecks, title: "Plan Mode", body: "Investigates first and writes a numbered implementation plan you can edit before a single file changes." },
  { icon: Braces, title: "Real code editor", body: "Monaco-powered editing with tabs, diagnostics, diffs and AI actions on any selection." },
  { icon: Terminal, title: "Integrated terminal", body: "Multiple shells, live output, and agent command execution behind explicit permissions." },
  { icon: Boxes, title: "Roblox & Rojo", body: "Rojo project awareness plus a Studio bridge architecture for scripts, instances and output logs." },
  { icon: Globe, title: "Web research", body: "The agent reads documentation and cites its sources before it commits to an approach." },
  { icon: FolderTree, title: "Project system", body: "Files, chats, agent history, memory, permissions and integrations scoped per project." },
  { icon: Puzzle, title: "Extensions & MCP", body: "A tool layer with permissions, custom modes and MCP-style integrations you can extend." },
  { icon: ImageIcon, title: "Vision & images", body: "Drop in screenshots and designs; generate icons, thumbnails and mockups into your project." },
  { icon: GitBranch, title: "Git built in", body: "Status, diffs, branches, history and AI-written commit messages." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Start building</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
            <p className="mono-xs uppercase tracking-[0.3em] text-primary">Autonomous development environment</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Your AI Development Environment
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Build software, websites, games and systems with an autonomous AI developer that understands your
              projects, edits your files, runs your tools, and works alongside you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg">Start Building</Button>
              </Link>
              <Link to="/download">
                <Button size="lg" variant="outline">
                  <Download className="size-4" /> Download Desktop App
                </Button>
              </Link>
            </div>

            <div className="mt-14 overflow-hidden rounded-lg border border-border bg-surface shadow-panel">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
                <span className="mono-xs ml-3 text-muted-foreground">nexus — my-roblox-fps</span>
              </div>
              <div className="grid grid-cols-1 divide-border text-sm md:grid-cols-[190px_1fr_240px] md:divide-x">
                <div className="hidden p-3 md:block">
                  <p className="mono-xs uppercase tracking-widest text-muted-foreground">Explorer</p>
                  <ul className="mono-xs mt-3 space-y-1.5 text-foreground/80">
                    <li>src/</li>
                    <li className="pl-3">server/</li>
                    <li className="pl-6 text-primary">InventoryService.luau</li>
                    <li className="pl-3">client/</li>
                    <li className="pl-6">InventoryController.luau</li>
                    <li className="pl-3">shared/</li>
                    <li className="pl-6">InventoryTypes.luau</li>
                    <li>default.project.json</li>
                  </ul>
                </div>
                <div className="space-y-3 p-4">
                  <p className="text-xs text-muted-foreground">You</p>
                  <p>Build a server-authoritative inventory system and fix the gun error.</p>
                  <p className="text-xs text-muted-foreground">NEXUS · Agent · Extreme</p>
                  <ul className="mono-xs space-y-1.5 text-foreground/85">
                    <li className="text-success">✓ Workspace detected — Rojo project</li>
                    <li className="text-success">✓ Read 14 source files</li>
                    <li className="text-success">✓ Plan created — 9 steps</li>
                    <li className="text-primary">✏️ Editing InventoryService.luau</li>
                    <li className="text-warning">⚠ Ownership not validated on server</li>
                    <li className="text-success">✓ Fix applied, tests passed</li>
                  </ul>
                </div>
                <div className="hidden p-3 md:block">
                  <p className="mono-xs uppercase tracking-widest text-muted-foreground">Agent activity</p>
                  <ul className="mono-xs mt-3 space-y-2 text-muted-foreground">
                    <li>10:41:03 started task</li>
                    <li>10:41:07 read project.json</li>
                    <li>10:41:19 created plan</li>
                    <li>10:41:26 edited 3 files</li>
                    <li>10:41:52 tests passed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Built like a developer tool, not a chat box</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface p-5">
                <f.icon className="size-4 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Ready when you are</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Create an account and open your first workspace. Everything you do is saved.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/auth">
                <Button size="lg"><Zap className="size-4" /> Start Building</Button>
              </Link>
              <Link to="/download">
                <Button size="lg" variant="outline">Desktop app</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Wordmark className="text-muted-foreground" />
        <p>NEXUS AI — working name. Original product, no affiliation with other tools.</p>
      </footer>
    </div>
  );
}
