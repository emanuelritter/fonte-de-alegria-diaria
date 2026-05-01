import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM = `Você é roteirista de carrosséis virais para Instagram, no estilo da @brandsdecoded: hook forte, atrito reflexivo, payoff emocional, CTA de compartilhamento.

Contexto: projeto "Fonte de Alegria Diária" — devocional cristão jovem, de inspiração adventista do sétimo dia (cita graça, esperança, sábado, segunda vinda quando couber, mas sem jargão pesado). Público: 20-45 anos, brasileiros, em busca de paz e propósito no dia a dia.

Você vai criar um carrossel de 7 slides baseado no devocional do dia. Estrutura obrigatória:

1. HOOK (slide 1) — pergunta ou afirmação provocadora, máx 12 palavras, gera curiosidade. Ex: "Você ora pedindo paz, mas continua em guerra com você mesmo?".
2. TENSÃO 1 (slide 2) — descreve a dor/situação real do leitor, máx 25 palavras.
3. TENSÃO 2 (slide 3) — aprofunda, mostra o padrão, máx 25 palavras.
4. VERSÍCULO (slide 4) — frase do versículo (pode encurtar mantendo sentido) + referência. Esse é o "payoff" espiritual.
5. APLICAÇÃO 1 (slide 5) — primeira virada prática para hoje, máx 25 palavras.
6. APLICAÇÃO 2 (slide 6) — segunda virada, mais íntima, máx 25 palavras.
7. CTA (slide 7) — convite emocional curto para compartilhar com alguém que precisa ouvir isso hoje. Máx 18 palavras. Termine com "@fontedealegriadiaria".

Regras:
- Linguagem jovem, direta, brasileira. Sem "irmão(ã)", sem "amados".
- Sem emojis nos textos dos slides (a arte cuida do visual).
- Frases curtas, ritmo de leitura rápido.
- Respeite a doutrina adventista (salvação pela graça, esperança da volta de Jesus, valor do descanso).

Além dos slides, escreva uma LEGENDA pronta para postagem (3-5 linhas), gancho na primeira linha + corpo + CTA "Salve, compartilhe e marque @fontedealegriadiaria" + 6 hashtags relevantes (sem #jesus genérico, prefira #fontedealegriadiaria #devocionaldiario #fé #esperança #vidacomdeus #adventista).`;

const TOOL = {
  type: "function",
  function: {
    name: "carrossel_devocional",
    parameters: {
      type: "object",
      properties: {
        hook: { type: "string" },
        tensao_1: { type: "string" },
        tensao_2: { type: "string" },
        versiculo_destaque: { type: "string" },
        versiculo_referencia: { type: "string" },
        aplicacao_1: { type: "string" },
        aplicacao_2: { type: "string" },
        cta: { type: "string" },
        legenda: { type: "string" },
      },
      required: [
        "hook", "tensao_1", "tensao_2", "versiculo_destaque", "versiculo_referencia",
        "aplicacao_1", "aplicacao_2", "cta", "legenda",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { devocional_id, regenerar } = await req.json();
    if (!devocional_id || typeof devocional_id !== "string") {
      return new Response(JSON.stringify({ error: "devocional_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gate `regenerar` behind admin auth — anon visitors cannot bypass cache.
    let isAdmin = false;
    if (regenerar) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const userClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: authUser } } = await userClient.auth.getUser();
        if (authUser) {
          const { data: roleRow } = await userClient.rpc("is_current_user_admin");
          isAdmin = roleRow === true;
        }
      }
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Apenas administradores podem regenerar." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Public read uses anon key so RLS enforces "publicado=true AND data<=today".
    const publicClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: dev, error } = await publicClient
      .from("devocionais")
      .select("id, titulo, versiculo, referencia, meditacao, oracao, carrossel_textos, carrossel_legenda, publicado, data")
      .eq("id", devocional_id)
      .eq("publicado", true)
      .lte("data", new Date().toISOString().slice(0, 10))
      .maybeSingle();
    if (error || !dev) {
      return new Response(JSON.stringify({ error: "Devocional não disponível." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!regenerar && dev.carrossel_textos && dev.carrossel_legenda) {
      return new Response(
        JSON.stringify({ slides: dev.carrossel_textos, legenda: dev.carrossel_legenda, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userMsg = `Devocional do dia:

TÍTULO: ${dev.titulo}
VERSÍCULO: ${dev.versiculo}
REFERÊNCIA: ${dev.referencia}
MEDITAÇÃO: ${dev.meditacao}
${dev.oracao ? `ORAÇÃO: ${dev.oracao}` : ""}

Crie o carrossel de 7 slides + legenda.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "carrossel_devocional" } },
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
    const args = JSON.parse(tc.function.arguments);
    const { legenda, ...slides } = args;

    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    await adminClient
      .from("devocionais")
      .update({ carrossel_textos: slides, carrossel_legenda: legenda })
      .eq("id", devocional_id)
      .eq("publicado", true);

    return new Response(JSON.stringify({ slides, legenda, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("gerar-carrossel-devocional error:", msg);
    return new Response(JSON.stringify({ error: "Não foi possível gerar agora. Tente novamente em instantes." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});