/** Development modes — specialised system behaviour for the agent. */

export interface DevMode {
  id: string;
  name: string;
  group: string;
  summary: string;
  instructions: string;
  preferredTier: string;
  projectTypes?: string[];
}

export const DEV_MODES: DevMode[] = [
  {
    id: "general",
    name: "General Agent",
    group: "Core",
    summary: "General software and computer agent.",
    instructions:
      "You are a general-purpose senior engineer. Inspect before changing, prefer minimal diffs, explain results concisely.",
    preferredTier: "balanced",
  },
  {
    id: "ui-designer",
    name: "UI Designer",
    group: "Core",
    summary: "UI, UX, CSS, layout, responsive systems.",
    instructions:
      "You specialise in interface design: layout, spacing, hierarchy, responsive behaviour, design tokens and component systems. Never hardcode one-off styles.",
    preferredTier: "creative",
  },
  {
    id: "website",
    name: "Website Builder",
    group: "Web",
    summary: "React, Next.js, HTML/CSS/TS, deployment.",
    instructions:
      "You build production websites with React/TypeScript. Care about semantics, SEO, accessibility and performance.",
    preferredTier: "coding",
    projectTypes: ["react", "next", "node"],
  },
  {
    id: "fullstack",
    name: "Full Stack Developer",
    group: "Web",
    summary: "Frontend, backend, database, APIs, auth, tests.",
    instructions:
      "You own the whole stack. Design data models first, enforce authorization at the server, then build UI.",
    preferredTier: "coding",
  },
  {
    id: "system-builder",
    name: "System Builder",
    group: "Core",
    summary: "Services, tooling, automation systems.",
    instructions: "You design long-lived systems: clear module boundaries, explicit interfaces, observability.",
    preferredTier: "ultra",
  },
  {
    id: "game-dev",
    name: "Game Developer",
    group: "Games",
    summary: "General game development.",
    instructions: "You build games: game loops, state, physics, input, performance budgets and feel.",
    preferredTier: "coding",
  },
  {
    id: "roblox",
    name: "Roblox Developer",
    group: "Roblox",
    summary: "Luau, replication, Rojo, server/client architecture.",
    instructions:
      "You are an expert Roblox engineer. Use Luau with strict typing where possible, server-authoritative logic, RemoteEvents/RemoteFunctions with validation, and Rojo project layouts (src/server, src/client, src/shared).",
    preferredTier: "coding",
    projectTypes: ["roblox"],
  },
  {
    id: "roblox-ui",
    name: "Roblox UI Developer",
    group: "Roblox",
    summary: "ScreenGuis, scaling, UI frameworks.",
    instructions:
      "You build Roblox interfaces: UDim2 scaling, UIListLayout/UIGridLayout, controller and mobile support, clean component modules.",
    preferredTier: "creative",
    projectTypes: ["roblox"],
  },
  {
    id: "roblox-systems",
    name: "Roblox Systems Developer",
    group: "Roblox",
    summary: "Inventory, combat, quests, data, matchmaking.",
    instructions:
      "You implement Roblox gameplay systems with server authority, DataStore persistence with retries, and typed shared schemas.",
    preferredTier: "extreme",
    projectTypes: ["roblox"],
  },
  {
    id: "fivem",
    name: "FiveM Developer",
    group: "Games",
    summary: "Lua/JS/C# resources, fxmanifest, NUI.",
    instructions:
      "You build FiveM resources: fxmanifest.lua, client/server/shared split, NUI interfaces, event security and vehicle/script resources.",
    preferredTier: "coding",
    projectTypes: ["fivem"],
  },
  {
    id: "minecraft",
    name: "Minecraft Developer",
    group: "Games",
    summary: "Plugins, mods, datapacks.",
    instructions: "You build Minecraft plugins/mods/datapacks with correct event lifecycles and server performance.",
    preferredTier: "coding",
  },
  {
    id: "unity",
    name: "Unity Developer",
    group: "Games",
    summary: "C#, MonoBehaviour, prefabs, physics.",
    instructions: "You build Unity games in C# with component-driven architecture and profiling awareness.",
    preferredTier: "coding",
    projectTypes: ["unity"],
  },
  {
    id: "unreal",
    name: "Unreal Developer",
    group: "Games",
    summary: "C++, Blueprints, gameplay framework.",
    instructions: "You build Unreal projects using the gameplay framework, C++ and Blueprint interop.",
    preferredTier: "coding",
    projectTypes: ["unreal"],
  },
  { id: "python", name: "Python Developer", group: "Languages", summary: "Python, typing, packaging, tests.", instructions: "You write idiomatic typed Python with tests and clean packaging.", preferredTier: "coding", projectTypes: ["python"] },
  { id: "javascript", name: "JavaScript Developer", group: "Languages", summary: "Modern JS, Node, tooling.", instructions: "You write modern JavaScript with clear module boundaries.", preferredTier: "coding", projectTypes: ["node"] },
  { id: "typescript", name: "TypeScript Developer", group: "Languages", summary: "Strict types, generics, DX.", instructions: "You write strict TypeScript, modelling domains with types before writing logic.", preferredTier: "coding" },
  { id: "csharp", name: "C# Developer", group: "Languages", summary: ".NET, async, LINQ.", instructions: "You write idiomatic C# with async patterns and dependency injection.", preferredTier: "coding", projectTypes: ["dotnet"] },
  { id: "cpp", name: "C++ Developer", group: "Languages", summary: "Modern C++, CMake, memory.", instructions: "You write modern C++ with RAII, value semantics and CMake builds.", preferredTier: "coding", projectTypes: ["cpp"] },
  { id: "lua", name: "Lua / Luau Developer", group: "Languages", summary: "Lua, Luau, embedded scripting.", instructions: "You write clean Lua/Luau modules with strict typing where the runtime supports it.", preferredTier: "coding" },
  {
    id: "research",
    name: "Web Research Agent",
    group: "Analysis",
    summary: "Searches the web, gathers docs, cites sources.",
    instructions: "You research before answering, prefer primary documentation, and always cite sources.",
    preferredTier: "research",
  },
  {
    id: "debugger",
    name: "Debugger",
    group: "Analysis",
    summary: "Reproduce, isolate, fix, verify.",
    instructions:
      "You debug methodically: reproduce, form a hypothesis, instrument, isolate, fix the root cause, then verify.",
    preferredTier: "thinking",
  },
  {
    id: "reviewer",
    name: "Code Reviewer",
    group: "Analysis",
    summary: "Reviews without editing unless told to.",
    instructions: "You review code. Do not modify files unless explicitly instructed. Report findings by severity.",
    preferredTier: "thinking",
  },
  {
    id: "security",
    name: "Security Reviewer",
    group: "Analysis",
    summary: "Finds vulnerabilities and unsafe patterns.",
    instructions:
      "You audit for injection, authorization gaps, secret exposure, unsafe deserialization and insecure defaults.",
    preferredTier: "thinking",
  },
  {
    id: "performance",
    name: "Performance Engineer",
    group: "Analysis",
    summary: "Profiling and optimisation.",
    instructions: "You measure before optimising, then remove the actual bottleneck and report the delta.",
    preferredTier: "extreme",
  },
  {
    id: "database",
    name: "Database Engineer",
    group: "Infrastructure",
    summary: "SQL, schema, migrations, indexes.",
    instructions: "You design normalised schemas, safe migrations and indexed queries.",
    preferredTier: "coding",
  },
  {
    id: "devops",
    name: "DevOps Agent",
    group: "Infrastructure",
    summary: "Git, CI/CD, Docker, environments.",
    instructions: "You automate builds, tests and deploys with reproducible environments.",
    preferredTier: "coding",
  },
  { id: "designer", name: "Designer", group: "Creative", summary: "Visual concepts and assets.", instructions: "You produce visual direction: palettes, type, layout systems and asset specs.", preferredTier: "creative" },
  { id: "image", name: "Image Agent", group: "Creative", summary: "Understands and generates images.", instructions: "You analyse images precisely and generate assets that match the project's visual language.", preferredTier: "image" },
  { id: "docs", name: "Documentation Agent", group: "Creative", summary: "Writes docs and READMEs.", instructions: "You write accurate, skimmable documentation with runnable examples.", preferredTier: "balanced" },
];

export const MODE_GROUPS = ["Core", "Web", "Games", "Roblox", "Languages", "Analysis", "Infrastructure", "Creative"];

export function getMode(id: string | null | undefined): DevMode {
  return DEV_MODES.find((m) => m.id === id) ?? DEV_MODES[0]!;
}

/** Project-type detection from a file listing. */
export function detectProjectType(paths: string[]): { type: string; label: string; suggestedMode: string } {
  const has = (needle: string) => paths.some((p) => p.toLowerCase().endsWith(needle.toLowerCase()));
  if (has("default.project.json") || has("project.json")) return { type: "roblox", label: "Roblox / Rojo", suggestedMode: "roblox" };
  if (has("fxmanifest.lua")) return { type: "fivem", label: "FiveM resource", suggestedMode: "fivem" };
  if (has("next.config.js") || has("next.config.ts")) return { type: "next", label: "Next.js", suggestedMode: "website" };
  if (has("package.json")) return { type: "node", label: "Node / Web", suggestedMode: "website" };
  if (has("requirements.txt") || has("pyproject.toml")) return { type: "python", label: "Python", suggestedMode: "python" };
  if (has("cargo.toml")) return { type: "rust", label: "Rust", suggestedMode: "typescript" };
  if (has(".csproj") || has(".sln")) return { type: "dotnet", label: ".NET / C#", suggestedMode: "csharp" };
  if (has("cmakelists.txt")) return { type: "cpp", label: "C++", suggestedMode: "cpp" };
  if (paths.some((p) => p.includes("Assets/") && p.includes("ProjectSettings"))) return { type: "unity", label: "Unity", suggestedMode: "unity" };
  if (has(".uproject")) return { type: "unreal", label: "Unreal", suggestedMode: "unreal" };
  return { type: "empty", label: "Generic workspace", suggestedMode: "general" };
}
