import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `Você é um pastor adventista do sétimo dia, fluente em inglês e português, especialista nos escritos de Ellen G. White e nas 28 Crenças Fundamentais da IASD.

Sua tarefa: receber um devocional do livro "Radiant Religion" (em inglês) e devolver versão em português brasileiro contemporâneo, fiel ao conteúdo original, em tom acolhedor e jovem, mantendo a profundidade espiritual.

Regras:
- Traduza título, versículo e meditação para PT-BR natural e fluente.
- Para o versículo: use a tradução Almeida Revista e Atualizada (ARA) ou tradução fiel quando não localizar.
- Para a referência bíblica: traduza nomes dos livros (ex: "1 Thessalonians" → "1 Tessalonicenses", "Psalms" → "Salmos").
- Limpe artefatos de OCR (palavras grudadas tipo "forthe breadof life" → "para o pão da vida").
- Mantenha as citações de fonte ao final de cada parágrafo (ex: "—Caminho a Cristo, p. 51.").
- Gere uma ORAÇÃO curta (3 a 5 linhas) baseada no tema, fiel à doutrina adventista do sétimo dia (salvação pela graça mediante a fé em Cristo, mediação de Cristo no santuário celestial, sábado como dia de descanso, esperança da segunda vinda). Termine com "Em nome de Jesus, amém."
- NÃO invente conteúdo. Se algo no original estiver corrompido/ilegível, faça o melhor sentido possível dentro do tema.`;

const TOOL = {
  type: "function",
  function: {
    name: "devocional_pt",
    description: "Versão em português do devocional + oração pastoral.",
    parameters: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        versiculo: { type: "string" },
        referencia: { type: "string" },
        meditacao: { type: "string" },
        oracao: { type: "string" },
      },
      required: ["titulo", "versiculo", "referencia", "meditacao", "oracao"],
      additionalProperties: false,
    },
  },
};

async function translateOne(item: any) {
  const userMsg = `Devocional original (inglês):

TÍTULO: ${item.titulo}
VERSÍCULO: ${item.versiculo}
REFERÊNCIA: ${item.referencia}
MEDITAÇÃO: ${item.meditacao}

Devolva versão em português + oração.`;

  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        tools: [TOOL],
        tool_choice: {
          type: "function",
          function: { name: "devocional_pt" },
        },
      }),
    },
  );

  if (resp.status === 429) throw new Error("RATE_LIMIT");
  if (resp.status === 402) throw new Error("NO_CREDITS");
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI_ERROR ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const tc = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc) throw new Error("NO_TOOL_CALL");
  return JSON.parse(tc.function.arguments);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Pega lote de pendentes (15 por execução para caber em ~60s)
  const { data: pendentes, error: errPend } = await supabase
    .from("devocionais_fonte")
    .select("*")
    .eq("traduzido", false)
    .order("data", { ascending: true })
    .limit(15);

  if (errPend) {
    return new Response(
      JSON.stringify({ error: errPend.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!pendentes || pendentes.length === 0) {
    return new Response(
      JSON.stringify({ status: "completo", processados: 0, restantes: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let processados = 0;
  const erros: any[] = [];

  for (const item of pendentes) {
    try {
      const pt = await translateOne(item);

      // Upsert na tabela final (publicado=false para revisão)
      const { error: upErr } = await supabase.from("devocionais").upsert(
        {
          data: item.data,
          titulo: pt.titulo,
          versiculo: pt.versiculo,
          referencia: pt.referencia,
          meditacao: pt.meditacao,
          oracao: pt.oracao,
          publicado: false,
          cta_nivel: 1,
        },
        { onConflict: "data" },
      );
      if (upErr) throw new Error(`UPSERT_ERR: ${upErr.message}`);

      await supabase
        .from("devocionais_fonte")
        .update({ traduzido: true, erro: null, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      processados++;
      // Pequeno delay para evitar rate limit
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      erros.push({ data: item.data, erro: msg });
      await supabase
        .from("devocionais_fonte")
        .update({ erro: msg, updated_at: new Date().toISOString() })
        .eq("id", item.id);
      // Se rate limit, para o lote
      if (msg === "RATE_LIMIT" || msg === "NO_CREDITS") break;
    }
  }

  const { count: restantes } = await supabase
    .from("devocionais_fonte")
    .select("*", { count: "exact", head: true })
    .eq("traduzido", false);

  return new Response(
    JSON.stringify({
      status: "ok",
      processados,
      erros,
      restantes: restantes ?? null,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});