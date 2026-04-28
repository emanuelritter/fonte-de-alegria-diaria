import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM = `Você é roteirista de carrosséis editoriais para Instagram, no estilo @brandsdecoded e arcOS: minimalismo elegante, ritmo de leitura curto, payoff emocional.

Projeto: "Fonte de Alegria Diária" — devocional cristão jovem, inspiração adventista (graça, esperança, sábado, segunda vinda quando couber, sem jargão pesado). Público 20-45, Brasil.

Você produzirá um carrossel editorial de 7 slides:

1. GANCHO — pergunta ou afirmação que faz parar o scroll. Máx 12 palavras.
2. CONTEXTO — frase única que descreve a situação do leitor. Máx 22 palavras.
3. VERSÍCULO — frase do versículo do devocional, podendo encurtar mantendo sentido. Máx 30 palavras.
   REFERÊNCIA — formato "Livro 1:1".
4. REFLEXÃO — verdade central do texto. UMA palavra-chave deve estar marcada com *asteriscos* para destacar em dourado. Máx 22 palavras.
5. APLICAÇÃO — exatamente 3 ações práticas, separadas por \\n (newline). Cada uma na forma imperativa, máx 12 palavras.
6. PERGUNTA — pergunta de fechamento que convida ao comentário. Máx 14 palavras.

Regras:
- Linguagem direta, brasileira, sem "irmão", "amados".
- Sem emojis nos textos dos slides.
- Frases curtas, sem clichês.
- Respeite a doutrina adventista.`;

const TOOL = {
  type: "function",
  function: {
    name: "carrossel_editorial",
    parameters: {
      type: "object",
      properties: {
        gancho: { type: "string" },
        contexto: { type: "string" },
        versiculo: { type: "string" },
        referencia: { type: "string" },
        reflexao: { type: "string" },
        aplicacao: { type: "string" },
        pergunta: { type: "string" },
      },
      required: ["gancho", "contexto", "versiculo", "referencia", "reflexao", "aplicacao", "pergunta"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth required
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { devocional_id } = await req.json();
    if (!devocional_id || typeof devocional_id !== "string") {
      return new Response(JSON.stringify({ error: "devocional_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: dev, error } = await userClient
      .from("devocionais")
      .select("titulo, versiculo, referencia, meditacao, oracao")
      .eq("id", devocional_id)
      .maybeSingle();
    if (error || !dev) {
      return new Response(JSON.stringify({ error: "Devocional não encontrado." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMsg = `Devocional do dia:

TÍTULO: ${dev.titulo}
VERSÍCULO: ${dev.versiculo}
REFERÊNCIA: ${dev.referencia}
MEDITAÇÃO: ${dev.meditacao}
${dev.oracao ? `ORAÇÃO: ${dev.oracao}` : ""}

Gere o carrossel editorial de 7 slides.`;

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
        tool_choice: { type: "function", function: { name: "carrossel_editorial" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas requisições. Tente em alguns segundos." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t.slice(0, 200));
      return new Response(JSON.stringify({ error: "Falha ao gerar." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error("Sem tool_call no retorno");
    const slides = JSON.parse(tc.function.arguments);

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("gerar-carrossel-editorial error:", msg);
    return new Response(JSON.stringify({ error: "Não foi possível gerar agora." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});