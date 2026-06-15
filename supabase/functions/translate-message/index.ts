import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Body = {
  message_id: string;
  target_language?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  return json({
    message_id: body.message_id,
    target_language: body.target_language ?? "de",
    translated_text: null,
    provider: "DeepL vorbereitet",
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
