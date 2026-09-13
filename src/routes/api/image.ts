import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

/** Image Agent: mockups, icons, thumbnails, textures, concept art. */
export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt?: string };
        if (!prompt) return new Response("prompt is required", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json", "Lovable-API-Key": apiKey },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            modalities: ["image", "text"],
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!res.ok) return new Response(await res.text(), { status: res.status });

        const json = (await res.json()) as {
          choices?: { message?: { images?: { image_url?: { url?: string } }[]; content?: string } }[];
        };
        const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!url) return new Response("The image model returned no image", { status: 502 });
        return Response.json({ url, note: json.choices?.[0]?.message?.content ?? "" });
      },
    },
  },
});
