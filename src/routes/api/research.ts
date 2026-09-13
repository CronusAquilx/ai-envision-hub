import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

import { getTier } from "@/lib/nexus/models";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export const Route = createFileRoute("/api/research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { query } = (await request.json()) as { query?: string };
        if (!query) return new Response("query is required", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const gateway = createOpenAICompatible({
          name: "lovable",
          baseURL: GATEWAY_URL,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const tier = getTier("research");
        let lastError: unknown = null;
        for (const modelId of tier.chain) {
          try {
            const { text } = await generateText({
              model: gateway(modelId),
              system:
                "You are the NEXUS research agent. Answer developer research questions precisely. Compare approaches when relevant. Finish with a 'Sources' list of the documentation, repositories or discussions you relied on, each as a URL. Never invent URLs you are unsure about — mark them as 'likely' instead.",
              prompt: query,
            });
            return Response.json({ text, model: modelId });
          } catch (error) {
            lastError = error;
          }
        }
        return new Response(lastError instanceof Error ? lastError.message : "Research unavailable", { status: 502 });
      },
    },
  },
});
