import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM = `Você cria HOOKS de uma linha para artes de Stories de Instagram do projeto "Fonte de Alegria Diária", devocional cristão de inspiração adventista.
Tom: jovem, acolhedor, contemporâneo, esperançoso. Nada de jargão religioso pesado.
Objetivo: fisgar quem vê o Stories e fazer essa pessoa querer ler o devocional do dia no site.
Regras:
- Máximo 14 palavras.
- Sem hashtags, sem emojis, sem aspas.
- Pode ser pergunta, afirmação ou convite.
- Conecte ao tema do devocional, não ao versículo literal.`;

const TOOL = {
  type: "function",
  function: {
    name: "hook_stories",
    parameters: {
      type: "object",
      properties: { hook: { type: "string" } },
      required: ["hook"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { devocional_id } = await req.json();
    if (!devocional_id || typeof devocional_id !== "string") {
      return new Response(JSON.stringify({ error: "devocional_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use anon-key client first so RLS enforces "publicado" visibility.
    const publicClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: dev, error } = await publicClient
      .from("devocionais")
      .select("id, titulo, versiculo, referencia, meditacao, hook_stories, publicado, data")
      .eq("id", devocional_id)
      .eq("publicado", true)
      .lte("data", new Date().toISOString().slice(0, 10))
      .maybeSingle();
    if (error || !dev) {
      return new Response(JSON.stringify({ error: "Devocional não disponível." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (dev.hook_stories) {
      return new Response(JSON.stringify({ hook: dev.hook_stories, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMsg = `TÍTULO: ${dev.titulo}
VERSÍCULO: ${dev.versiculo} (${dev.referencia})
MEDITAÇÃO: ${String(dev.meditacao).slice(0, 1200)}

Crie o hook.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "hook_stories" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas requisições, tente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`AI ${resp.status}: ${t.slice(0, 200)}`);
    }

    const data = await resp.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error("Sem tool_call");
    const { hook } = JSON.parse(tc.function.arguments);

    // Service-role write back, scoped to the same published row.
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    await adminClient
      .from("devocionais")
      .update({ hook_stories: hook })
      .eq("id", devocional_id)
      .eq("publicado", true);

    return new Response(JSON.stringify({ hook, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("gerar-hook-devocional error:", msg);
    return new Response(JSON.stringify({ error: "Não foi possível gerar agora. Tente novamente em instantes." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});