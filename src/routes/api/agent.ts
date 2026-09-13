import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

import { getTier } from "@/lib/nexus/models";
import { getMode } from "@/lib/nexus/modes";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

type Body = {
  goal?: string;
  tier?: string;
  mode?: string;
  instructions?: string;
  planOnly?: boolean;
  iteration?: number;
  maxIterations?: number;
  tree?: string;
  transcript?: string[];
  tools?: string;
  bridgeConnected?: boolean;
};

function parseJson(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("The model did not return a decision object");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!body.goal) return new Response("goal is required", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const gateway = createOpenAICompatible({
          name: "lovable",
          baseURL: GATEWAY_URL,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const tier = getTier(body.tier);
        const mode = getMode(body.mode);

        const system = [
          "You are the NEXUS agent runtime. You work in short iterations and answer ONLY with a single JSON object.",
          "Schema: {\"thought\": string, \"plan\": string[] (optional), \"actions\": [{\"tool\": string, \"args\": object}], \"question\": string (optional), \"done\": boolean, \"summary\": string (optional)}",
          "Rules:",
          "- Inspect before you edit. Read a file before overwriting it.",
          "- filesystem.write takes the FULL new file content, never a patch or placeholder.",
          "- Prefer 1-4 actions per iteration, then react to the observations.",
          "- Ask a question only when genuinely blocked; put it in \"question\" and leave \"done\" false.",
          "- When the work is verified, set done true and write a short summary: what changed, results, next step.",
          "- If a tool is unavailable, adapt: pick another route or explain the limit in the summary.",
          `Active mode: ${mode.name}. ${mode.instructions}`,
          `Available tools:\n${body.tools ?? ""}`,
          body.bridgeConnected
            ? "The desktop bridge IS connected: terminal, git and Roblox tools work against the user's real machine."
            : "The desktop bridge is NOT connected: terminal, git, Roblox and MCP tools will fail. Work through the workspace files only and say so if a shell is required.",
          body.planOnly
            ? "PLAN MODE: read-only. You may use project.tree, filesystem.read, filesystem.search and web.search only. Never write, delete, rename or run commands. Produce a numbered plan in \"plan\" and set done true once the plan is complete."
            : "",
          body.instructions ? `Project instructions:\n${body.instructions}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        const prompt = [
          `Goal: ${body.goal}`,
          `Iteration ${body.iteration ?? 1} of ${body.maxIterations ?? 12}.`,
          `Workspace files:\n${body.tree || "(empty)"}`,
          body.transcript?.length ? `Observations so far:\n${body.transcript.join("\n")}` : "No actions taken yet.",
          "Reply with the JSON decision object only.",
        ].join("\n\n");

        let lastError: unknown = null;
        for (const modelId of tier.chain) {
          try {
            const { text } = await generateText({ model: gateway(modelId), system, prompt });
            const decision = parseJson(text);
            return Response.json(decision, { headers: { "X-Nexus-Model": modelId, "X-Nexus-Tier": tier.id } });
          } catch (error) {
            lastError = error;
            console.error("[nexus:agent] model failed, trying fallback", modelId, error);
          }
        }
        const message = lastError instanceof Error ? lastError.message : "All models unavailable";
        return new Response(message, { status: 502 });
      },
    },
  },
});
