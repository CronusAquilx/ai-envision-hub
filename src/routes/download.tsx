import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, Cpu, HardDrive, Monitor, ShieldCheck, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/nexus/Logo";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download the NEXUS AI desktop app" },
      {
        name: "description",
        content:
          "Install NEXUS AI on Windows, macOS or Linux for real local filesystem access, integrated terminals, Git and a local agent bridge.",
      },
      { property: "og:title", content: "Download the NEXUS AI desktop app" },
      { property: "og:description", content: "Native desktop app with local filesystem, terminal and agent bridge." },
    ],
  }),
  component: Download,
});

const PLATFORMS = [
  { icon: Monitor, name: "Windows", detail: "NSIS installer (.exe) · x64 + arm64" },
  { icon: Apple, name: "macOS", detail: "Disk image (.dmg) · Apple silicon + Intel" },
  { icon: HardDrive, name: "Linux", detail: "AppImage and .deb" },
];

const CAPABILITIES = [
  { icon: Terminal, title: "Real terminals", body: "PowerShell, CMD, bash or zsh with live output the agent can read." },
  { icon: Cpu, title: "Local agent bridge", body: "A sandboxed local service executes filesystem and command tools over secure IPC." },
  { icon: ShieldCheck, title: "Explicit permissions", body: "Folder grants, per-tool permissions and confirmation rules you control." },
];

function Download() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/"><Wordmark /></Link>
          <Link to="/auth"><Button size="sm">Open the web app</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Desktop app</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The desktop build is a native application shell with its own local agent bridge — not the website in a window.
          It opens folders on your machine, runs real shells, talks to Git, and connects to Roblox Studio through Rojo or
          the Studio bridge.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex flex-col gap-3 bg-surface p-5">
              <p.icon className="size-5 text-primary" />
              <div>
                <h2 className="text-sm font-semibold">{p.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{p.detail}</p>
              </div>
              <Button variant="outline" size="sm" className="mt-auto" disabled>
                Build not published yet
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Installers are produced by the desktop shell in stage 2 of this build. The web app is fully usable today and
          shares the same account, projects and chat history.
        </p>

        <h2 className="mt-14 font-display text-xl font-semibold">What the desktop build adds</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="bg-surface p-5">
              <c.icon className="size-4 text-accent" />
              <h3 className="mt-3 text-sm font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
