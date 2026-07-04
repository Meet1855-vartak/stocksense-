import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { question, context } = await req.json()

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an inventory and sales assistant for a small shop owner. You are given their current data as JSON context. Answer their question clearly and concisely using only this data. If asked for reorder suggestions, base them on quantity vs reorder_threshold and recent sales velocity if available. Keep answers short, practical, and in plain language — no markdown headers.",
          },
          {
            role: "user",
            content: `Shop data:\n${JSON.stringify(context)}\n\nQuestion: ${question}`,
          },
        ],
      }),
    })

    const data = await groqRes.json()
    const answer = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate an answer."

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})