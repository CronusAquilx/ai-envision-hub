import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/nexus/Logo";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "NEXUS AI help — agent mode, plan mode, Roblox, permissions" },
      {
        name: "description",
        content:
          "How to use NEXUS AI: getting started, agent mode, plan mode, the desktop bridge, folder permissions, Roblox and Rojo, MCP tools, extensions and models.",
      },
      { property: "og:title", content: "NEXUS AI help centre" },
      { property: "og:description", content: "Guides for agent mode, plan mode, permissions, Roblox, MCP tools and the desktop app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Help,
});

const TOPICS: { title: string; body: string[] }[] = [
  {
    title: "Getting started",
    body: [
      "Create a project from the dashboard. Pick a template (React, Node, Python, Roblox/Rojo, FiveM) or start empty.",
      "The workspace has the file explorer on the left, chat and editor in the middle, agent activity on the right and a terminal below. Every panel can be resized or hidden.",
    ],
  },
  {
    title: "Agent mode",
    body: [
      "Give the agent a goal in the Agent tab. It inspects the project, plans, edits files, runs commands where it is allowed, checks the result and fixes what it broke.",
      "Every tool call is listed as it happens with its output. Pause, resume or stop at any time; a restore point is taken before the first change.",
    ],
  },
  {
    title: "Plan mode",
    body: [
      "Plan mode investigates without changing anything and returns a numbered plan with a goal line. Start implementation, or cancel and refine the goal.",
    ],
  },
  {
    title: "Reviewing changes",
    body: [
      "The Changes tab shows a diff per modified file with accept, reject and open. Review all changes at once, or one at a time.",
      "Undo last AI change reverts the most recent file the agent wrote. Restore points bring the whole project back.",
    ],
  },
  {
    title: "Permissions",
    body: [
      "File access can ask every time, ask only for destructive actions, allow everything, or be restricted. Terminal access has the same levels plus off.",
      "Git, web, Roblox and external tool access are individual switches. Destructive actions always ask, whatever the level.",
    ],
  },
  {
    title: "The desktop app and local access",
    body: [
      "The desktop app runs a local bridge on this computer. It is the only thing that touches your real files, shells, Git and Roblox Studio.",
      "You grant folders explicitly — Desktop, Documents, Downloads, dev folders, external drives — and can revoke them at any time. Without the app, the workspace runs entirely in the cloud.",
    ],
  },
  {
    title: "Roblox and Rojo",
    body: [
      "Three connection methods: Rojo, the Studio plugin, and an MCP-style bridge. All three run through the desktop app.",
      "A Rojo project uses src/server, src/client and src/shared with a project file that maps them into the place. Sync pushes the workspace into Studio; inspect reads the instance tree, scripts and output.",
    ],
  },
  {
    title: "MCP tools and extensions",
    body: [
      "Connected tools (GitHub, databases, Docker, browser, Roblox Studio, custom servers) are called through one controlled tool layer with per-tool permissions.",
      "Extensions add commands, panels, agent tools, project detectors and language support. Install, enable, disable or remove them from the Extensions panel.",
    ],
  },
  {
    title: "Models",
    body: [
      "There are no personal API keys. Pick a tier — Fast, Balanced, Thinking, Extreme, Ultra, Coding, Vision, Image or Web Research — and the platform routes to a model and falls back automatically if one is unavailable.",
    ],
  },
  {
    title: "Keyboard shortcuts",
    body: [
      "Ctrl/Cmd+P quick open · Ctrl/Cmd+Shift+P command palette · Ctrl/Cmd+B sidebar · Ctrl/Cmd+J bottom panel · Ctrl/Cmd+Enter send.",
    ],
  },
];

function Help() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const topics = term
    ? TOPICS.filter((t) => (t.title + t.body.join(" ")).toLowerCase().includes(term))
    : TOPICS;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/"><Wordmark /></Link>
          <Link to="/dashboard"><Button size="sm" variant="outline">Open workspace</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Help</h1>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search help" className="mt-5 max-w-sm" />

        <div className="mt-8 divide-y divide-border border-y border-border">
          {topics.map((t) => (
            <article key={t.title} className="py-5">
              <h2 className="text-sm font-semibold">{t.title}</h2>
              {t.body.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </article>
          ))}
          {topics.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nothing matches “{q}”.</p>}
        </div>
      </main>
    </div>
  );
}
