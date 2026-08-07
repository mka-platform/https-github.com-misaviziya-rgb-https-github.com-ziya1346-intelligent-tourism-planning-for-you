// AI Trip Planner chat endpoint (Implements SRS-AI-01).
// NOTE (MOS-0200 TBD): streaming proxy to the Lovable AI Gateway pending final AI architecture.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATALOG = [
  { id: "forest", name: "Forest Haven", area: "Pacific Northwest", price: 85, rating: 4.9, features: ["Private campsite", "Fire pit", "Solar shower"] },
  { id: "lake", name: "Lakeside Retreat", area: "Mountain Valley", price: 95, rating: 5.0, features: ["Waterfront", "Kayak included", "Composting toilet"] },
  { id: "meadow", name: "Meadow Vista", area: "Alpine Range", price: 75, rating: 4.8, features: ["Panoramic views", "Hiking trails", "Wildlife viewing"] },
  { id: "canyon", name: "Canyon Ridge", area: "Desert Southwest", price: 65, rating: 4.7, features: ["Desert views", "Stargazing", "Rock formations"] },
  { id: "river", name: "River Bend", area: "Coastal Range", price: 110, rating: 4.9, features: ["River access", "Fishing", "Forest trails"] },
  { id: "summit", name: "Summit Peak", area: "Rocky Mountains", price: 120, rating: 4.6, features: ["High altitude", "Mountain views", "Adventure trails"] },
];

const OFFERS = [
  "MIDWEEK20: 20% off Sunday-Thursday stays",
  "LONGSTAY: 4th night free on stays of 4+ nights",
  "EARLYBIRD: 10% off when booking 30+ days ahead",
];

const SYSTEM_PROMPT = `You are the Mosavi Travel Planner, an expert trip-planning assistant.

Ground truth catalog (never invent destinations, prices or ratings):
${CATALOG.map((l) => `- ${l.name} (id: ${l.id}) — ${l.area}, $${l.price}/night, rating ${l.rating}, features: ${l.features.join(", ")}`).join("\n")}

Current special offers:
${OFFERS.map((o) => `- ${o}`).join("\n")}

Rules:
1. When the traveller gives (or you can infer) a budget, stay duration or trip style, always answer with exactly THREE tailored options, ordered best-fit first.
2. Each option must use "### 1) <Location name>" style headings and include: total estimated price (nightly price x nights, applying any offer that qualifies), why it fits, and one highlight day of the itinerary.
3. If budget, duration or guest count is missing, ask one short question first, then give the three options.
4. Support itineraries, comparisons and general travel questions too.
5. Reply in the same language the traveller writes in (Persian, English, Arabic, ...). Keep it concise and use markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-20)],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const detail = await response.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
