/**
 * Extension catalogue + host API surface.
 *
 * Extensions declare contributions; the host mounts them into the workspace.
 * The catalogue below ships with the product; third-party extensions register
 * through the same shape via `registerExtension`.
 */

export type ExtensionCategory =
  | "AI"
  | "Roblox"
  | "Web"
  | "Python"
  | "JavaScript"
  | "Game Dev"
  | "Git"
  | "Databases"
  | "DevOps"
  | "Productivity"
  | "Themes"
  | "Tools";

export interface ExtensionContribution {
  commands?: { id: string; title: string }[];
  panels?: { id: string; title: string }[];
  agentTools?: string[];
  projectDetectors?: string[];
  languages?: string[];
  integrations?: string[];
}

export interface ExtensionManifest {
  id: string;
  name: string;
  author: string;
  version: string;
  category: ExtensionCategory;
  description: string;
  permissions: string[];
  contributes: ExtensionContribution;
}

export const EXTENSION_CATALOGUE: ExtensionManifest[] = [
  {
    id: "nexus.roblox-studio",
    name: "Roblox Studio Bridge",
    author: "NEXUS",
    version: "1.2.0",
    category: "Roblox",
    description: "Connect Studio through Rojo, the Studio plugin or the MCP bridge. Read instances, scripts, properties and output.",
    permissions: ["bridge", "files:read", "files:write"],
    contributes: { panels: [{ id: "roblox", title: "Roblox" }], agentTools: ["roblox.inspect", "roblox.sync"], projectDetectors: ["project.json"] },
  },
  {
    id: "nexus.rojo",
    name: "Rojo Sync",
    author: "NEXUS",
    version: "1.0.4",
    category: "Roblox",
    description: "Serve a Rojo project, watch source folders and report sync status in the status bar.",
    permissions: ["bridge", "terminal:execute"],
    contributes: { commands: [{ id: "rojo.serve", title: "Rojo: Serve project" }], agentTools: ["terminal.execute"] },
  },
  {
    id: "nexus.github",
    name: "GitHub",
    author: "NEXUS",
    version: "2.0.1",
    category: "Git",
    description: "Repositories, issues and pull requests, with AI-written commit messages and PR summaries.",
    permissions: ["git", "network"],
    contributes: { commands: [{ id: "github.pr", title: "GitHub: Open pull request" }], integrations: ["github"] },
  },
  {
    id: "nexus.postgres",
    name: "Postgres Explorer",
    author: "NEXUS",
    version: "1.1.0",
    category: "Databases",
    description: "Browse schemas, run queries and let the database agent design migrations.",
    permissions: ["network"],
    contributes: { panels: [{ id: "db", title: "Database" }], agentTools: ["mcp.call"] },
  },
  {
    id: "nexus.docker",
    name: "Docker",
    author: "NEXUS",
    version: "1.0.0",
    category: "DevOps",
    description: "Containers, images and compose stacks with logs streamed into the terminal.",
    permissions: ["bridge", "terminal:execute"],
    contributes: { commands: [{ id: "docker.up", title: "Docker: Compose up" }] },
  },
  {
    id: "nexus.python-tools",
    name: "Python Toolchain",
    author: "NEXUS",
    version: "1.3.2",
    category: "Python",
    description: "Virtual environments, pytest runs, ruff diagnostics and type checking.",
    permissions: ["bridge", "terminal:execute"],
    contributes: { languages: ["python"], projectDetectors: ["requirements.txt", "pyproject.toml"] },
  },
  {
    id: "nexus.web-preview",
    name: "Live Web Preview",
    author: "NEXUS",
    version: "1.4.0",
    category: "Web",
    description: "Start dev servers, preview at mobile or desktop widths and pipe console errors to the agent.",
    permissions: ["bridge", "terminal:execute"],
    contributes: { panels: [{ id: "preview", title: "Preview" }] },
  },
  {
    id: "nexus.fivem",
    name: "FiveM Toolkit",
    author: "NEXUS",
    version: "0.9.0",
    category: "Game Dev",
    description: "fxmanifest scaffolding, client/server/shared layout, NUI templates and vehicle data helpers.",
    permissions: ["files:write"],
    contributes: { projectDetectors: ["fxmanifest.lua"], languages: ["lua"] },
  },
  {
    id: "nexus.unity",
    name: "Unity Companion",
    author: "NEXUS",
    version: "1.0.2",
    category: "Game Dev",
    description: "Solution awareness, C# analysis and play-mode log capture.",
    permissions: ["bridge"],
    contributes: { projectDetectors: ["Assets", "ProjectSettings"], languages: ["csharp"] },
  },
  {
    id: "nexus.midnight-theme",
    name: "Midnight Contrast",
    author: "NEXUS",
    version: "1.0.0",
    category: "Themes",
    description: "A deeper, higher-contrast variant of the NEXUS palette for OLED displays.",
    permissions: [],
    contributes: {},
  },
  {
    id: "nexus.research",
    name: "Web Research Agent",
    author: "NEXUS",
    version: "1.1.1",
    category: "AI",
    description: "Docs, GitHub and Stack Overflow research with cited sources in the Research panel.",
    permissions: ["network"],
    contributes: { agentTools: ["web.search"], panels: [{ id: "research", title: "Research" }] },
  },
  {
    id: "nexus.snippets",
    name: "Snippet Library",
    author: "NEXUS",
    version: "1.0.0",
    category: "Productivity",
    description: "Reusable snippets per language and project type, insertable by the agent.",
    permissions: [],
    contributes: { commands: [{ id: "snippets.insert", title: "Snippets: Insert" }] },
  },
];

const registry = new Map<string, ExtensionManifest>(EXTENSION_CATALOGUE.map((e) => [e.id, e]));

export function registerExtension(manifest: ExtensionManifest) {
  registry.set(manifest.id, manifest);
}

export function listExtensions() {
  return [...registry.values()];
}

export function getExtension(id: string) {
  return registry.get(id);
}

export const EXTENSION_CATEGORIES: ExtensionCategory[] = [
  "AI",
  "Roblox",
  "Web",
  "Python",
  "JavaScript",
  "Game Dev",
  "Git",
  "Databases",
  "DevOps",
  "Productivity",
  "Themes",
  "Tools",
];
