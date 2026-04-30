export type CarrosselData = {
  data: string;
  titulo: string;
  gancho: string;
  contexto: string;
  versiculo: string;
  referencia: string;
  reflexao: string;
  aplicacao: string;
  pergunta: string;
};

export const EMPTY_CARROSSEL: CarrosselData = {
  data: new Date().toISOString().slice(0, 10),
  titulo: "",
  gancho: "",
  contexto: "",
  versiculo: "",
  referencia: "",
  reflexao: "",
  aplicacao: "",
  pergunta: "",
};

export const DRAFT_KEY = "fda-carousel-draft";

/**
 * Splits text on *highlighted* tokens.
 * "uma *palavra* dourada" -> [{t:"uma "},{t:"palavra",h:true},{t:" dourada"}]
 */
export function parseHighlight(text: string): { t: string; h?: boolean }[] {
  if (!text) return [{ t: "" }];
  const parts: { t: string; h?: boolean }[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: text.slice(last, m.index) });
    parts.push({ t: m[1], h: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: text.slice(last) });
  return parts;
}

export const TOTAL_SLIDES = 7;

export const padSlide = (n: number) =>
  `${String(n).padStart(2, "0")}/${String(TOTAL_SLIDES).padStart(2, "0")}`;

/* ====== Tokens de cor dos slides (paleta solar do projeto) ====== */
export const C = {
  coral: "#F1684E",
  coralDeep: "#D5482E",
  coralDark: "#A6371F",
  teal: "#0F4451",
  tealDeep: "#0B3640",
  tealInk: "#072830",
  sand: "#FFE9C7",
  sandDeep: "#F4D9A6",
  gold: "#F4C04D",
  goldSoft: "#FFD77A",
  cream: "#FFF6E8",
  white: "#FFFFFF",
} as const;

/** Formata data ISO em "01 jan" para selos. */
export const formatDataCurta = (iso: string) => {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00")
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      .replace(".", "")
      .toUpperCase();
  } catch {
    return "";
  }
};