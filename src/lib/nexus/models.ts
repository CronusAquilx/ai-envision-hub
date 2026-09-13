/**
 * Model / provider abstraction layer.
 *
 * The UI never talks about vendors. It talks about capability tiers
 * ("Fast", "Ultra", "Vision", ...). Each tier maps to an ordered list of
 * backing model ids so a new provider can be added, reordered, or swapped
 * without touching the application.
 */

export type ModelCapability = "text" | "vision" | "image" | "research" | "code" | "reasoning";

export type ModelTierId =
  | "lite"
  | "fast"
  | "balanced"
  | "coding"
  | "thinking"
  | "extreme"
  | "ultra"
  | "vision"
  | "image"
  | "research"
  | "creative";

export interface ModelTier {
  id: ModelTierId;
  label: string;
  tagline: string;
  description: string;
  /** Ordered backing models: index 0 is primary, the rest are fallbacks. */
  chain: string[];
  capabilities: ModelCapability[];
  reasoning?: "none" | "low" | "medium" | "high";
  badge?: string;
}

export const MODEL_TIERS: ModelTier[] = [
  {
    id: "lite",
    label: "Lite",
    tagline: "Cheapest, instant",
    description: "Small edits, renames, quick questions.",
    chain: ["google/gemini-3.1-flash-lite", "openai/gpt-5.4-nano"],
    capabilities: ["text", "code"],
  },
  {
    id: "fast",
    label: "Super Fast",
    tagline: "Latency first",
    description: "Quick coding, simple fixes, short tasks.",
    chain: ["google/gemini-3.8-flash", "openai/gpt-5.6-luna"],
    capabilities: ["text", "code", "vision"],
  },
  {
    id: "balanced",
    label: "Balanced",
    tagline: "Default",
    description: "The everyday driver — good speed, strong reasoning.",
    chain: ["openai/gpt-5.6-terra", "google/gemini-3.8-flash"],
    capabilities: ["text", "code", "vision"],
    badge: "Default",
  },
  {
    id: "coding",
    label: "Coding",
    tagline: "Programming tuned",
    description: "Refactors, multi-file edits, tests, debugging.",
    chain: ["openai/gpt-5.6-sol", "openai/gpt-5.5"],
    capabilities: ["text", "code"],
  },
  {
    id: "thinking",
    label: "Deep Thinking",
    tagline: "Extra reasoning",
    description: "Hard bugs and design decisions that need real thought.",
    chain: ["openai/gpt-5.5", "google/gemini-3.1-pro-preview"],
    capabilities: ["text", "code", "reasoning"],
    reasoning: "high",
  },
  {
    id: "extreme",
    label: "Extreme",
    tagline: "Maximum effort",
    description: "Large refactors, complex debugging, long autonomous runs.",
    chain: ["openai/gpt-6-astra", "openai/gpt-5.6-sol"],
    capabilities: ["text", "code", "reasoning"],
    reasoning: "high",
  },
  {
    id: "ultra",
    label: "Ultra",
    tagline: "Architecture grade",
    description: "Whole-system planning and huge projects.",
    chain: ["openai/gpt-5.5-pro", "openai/gpt-6-astra"],
    capabilities: ["text", "code", "reasoning"],
    reasoning: "high",
    badge: "Max",
  },
  {
    id: "vision",
    label: "Vision",
    tagline: "Screenshots & designs",
    description: "Understands UI mockups, error screenshots, game captures.",
    chain: ["google/gemini-3.1-pro-preview", "openai/gpt-5.5"],
    capabilities: ["text", "vision"],
  },
  {
    id: "image",
    label: "Image",
    tagline: "Asset generation",
    description: "Icons, thumbnails, textures, mockups and concept art.",
    chain: ["google/gemini-3.1-flash-image", "lovable/image-standard"],
    capabilities: ["image"],
  },
  {
    id: "research",
    label: "Web Research",
    tagline: "Reads the web",
    description: "Gathers docs and sources before acting.",
    chain: ["google/gemini-3.8-flash", "openai/gpt-5.6-terra"],
    capabilities: ["text", "research"],
  },
  {
    id: "creative",
    label: "Creative",
    tagline: "Design & copy",
    description: "UI direction, naming, writing, visual concepts.",
    chain: ["openai/gpt-5.6-terra", "google/gemini-3.1-pro-preview"],
    capabilities: ["text", "image"],
  },
];

export const DEFAULT_TIER: ModelTierId = "balanced";

export function getTier(id: string | null | undefined): ModelTier {
  return MODEL_TIERS.find((t) => t.id === id) ?? MODEL_TIERS.find((t) => t.id === DEFAULT_TIER)!;
}

/** Route a task to the best tier when the user leaves it on automatic. */
export function routeTier(input: {
  hasImages?: boolean;
  wantsImage?: boolean;
  wantsResearch?: boolean;
  agentMode?: "chat" | "plan" | "agent";
  complexity?: "low" | "medium" | "high";
}): ModelTierId {
  if (input.wantsImage) return "image";
  if (input.hasImages) return "vision";
  if (input.wantsResearch) return "research";
  if (input.agentMode === "plan") return "thinking";
  if (input.agentMode === "agent") return input.complexity === "high" ? "extreme" : "coding";
  if (input.complexity === "high") return "ultra";
  if (input.complexity === "low") return "fast";
  return "balanced";
}
