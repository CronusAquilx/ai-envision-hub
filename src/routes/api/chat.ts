import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { getTier } from "@/lib/nexus/models";
import { getMode } from "@/lib/nexus/modes";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

type ChatBody = {
  messages?: UIMessage[];
  tier?: string;
  mode?: string;
  agentMode?: "chat" | "plan" | "agent";
  autonomy?: string;
  projectContext?: string;
  projectInstructions?: string;
  globalMemory?: string;
};

function systemPrompt(body: ChatBody) {
  const mode = getMode(body.mode);
  const agentMode = body.agentMode ?? "chat";

  const base = [
    "You are NEXUS, an autonomous AI development environment embedded in the user's IDE.",
    "Be concise. Lead with what you did or what you need. Never pad with pleasantries.",
    "When you describe work, structure it as: what I'm doing, what changed, errors, results, next step.",
    `Active development mode: ${mode.name}. ${mode.instructions}`,
  ];

  if (agentMode === "plan") {
    base.push(
      "PLAN MODE: do not propose file writes as if they already happened. Investigate, then output a numbered implementation plan with a Goal line first, each step short and verifiable. End with the risks and the files you expect to touch.",
    );
  } else if (agentMode === "agent") {
    base.push(
      "AGENT MODE: work autonomously. State the step you are on, the file or command involved, and the outcome. Ask a question only if you are genuinely blocked.",
    );
  }

  if (body.projectContext) base.push(`Workspace context:\n${body.projectContext}`);
  if (body.projectInstructions) base.push(`Project instructions from the user:\n${body.projectInstructions}`);
  if (body.globalMemory) base.push(`User preferences:\n${body.globalMemory}`);

  return base.join("\n\n");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("messages are required", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const gateway = createOpenAICompatible({
          name: "lovable",
          baseURL: GATEWAY_URL,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const tier = getTier(body.tier);
        const modelMessages = await convertToModelMessages(body.messages);
        const system = systemPrompt(body);

        // Provider abstraction: walk the tier's model chain until one accepts the request.
        let lastError: unknown = null;
        for (let i = 0; i < tier.chain.length; i++) {
          const modelId = tier.chain[i]!;
          try {
            const result = streamText({
              model: gateway(modelId),
              system,
              messages: modelMessages,
              providerOptions: {
                lovable: modelId.startsWith("openai/gpt-5.6") ? { reasoning_effort: "none" } : {},
              },
              onError: ({ error }) => console.error("[nexus:ai]", modelId, error),
            });

            return result.toUIMessageStreamResponse({
              originalMessages: body.messages,
              headers: { "X-Nexus-Model": modelId, "X-Nexus-Tier": tier.id },
            });
          } catch (error) {
            lastError = error;
            console.error("[nexus:ai] model unavailable, trying fallback", modelId, error);
          }
        }

        const message = lastError instanceof Error ? lastError.message : "All models unavailable";
        return new Response(message, { status: 502 });
      },
    },
  },
});
