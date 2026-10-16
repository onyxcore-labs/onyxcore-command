import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED = ["google/gemini-3.1-flash-lite", "google/gemini-3.7-flash", "google/gemini-3.8-flash"];

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        model: z.string().refine((m) => ALLOWED.includes(m)),
        founder: z.string().max(80),
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
          .max(40),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI Advisor is not configured.");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: data.model,
        messages: [
          {
            role: "system",
            content: `You are the OnyxCore AI Advisor for a 4-founder deep-tech hardware startup (ESP32 firmware, IoT telemetry, backend pipelines, client pilots). You are talking to ${data.founder}. Be concise and technical. Use Markdown; write math in LaTeX with $...$ or $$...$$.`,
          },
          ...data.messages,
        ],
      }),
    });
    if (res.status === 429) throw new Error("Advisor is rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    if (!res.ok) throw new Error(`Advisor error (${res.status})`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { reply: json.choices?.[0]?.message?.content ?? "" };
  });
