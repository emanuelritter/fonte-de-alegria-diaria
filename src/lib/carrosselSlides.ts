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