/* Utilitários de canvas para gerar artes do projeto Fonte de Alegria. */

export const ensureFonts = async () => {
  if (typeof document === "undefined") return;
  // Fontes já carregadas via Google Fonts no index.html.
  // Pré-aquece para o canvas conseguir medir corretamente.
  try {
    await Promise.all([
      (document as any).fonts.load("700 96px Fraunces"),
      (document as any).fonts.load("400 36px Inter"),
      (document as any).fonts.load("600 28px Inter"),
      (document as any).fonts.load("italic 400 40px Fraunces"),
    ]);
    await (document as any).fonts.ready;
  } catch {
    /* ignora */
  }
};

/** Quebra texto em linhas que cabem em maxWidth, respeitando palavras. */
export const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] => {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width <= maxWidth) {
        cur = test;
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    lines.push(""); // separador entre parágrafos
  }
  // remove último separador vazio
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
};

/** Desenha texto centralizado verticalmente em uma área. Retorna y final. */
export const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "center",
) => {
  ctx.textAlign = align;
  const lines = wrapLines(ctx, text, maxWidth);
  let cy = y;
  for (const line of lines) {
    if (line === "") {
      cy += lineHeight * 0.4;
      continue;
    }
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
};

/** Mede altura total de um texto quebrado. */
export const measureWrapped = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
) => {
  const lines = wrapLines(ctx, text, maxWidth);
  let h = 0;
  for (const l of lines) h += l === "" ? lineHeight * 0.4 : lineHeight;
  return h;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas vazio"))),
      "image/png",
      1,
    );
  });

/** Formata data ISO yyyy-mm-dd em "01 de janeiro de 2026". */
export const formatDataLonga = (iso: string) =>
  new Date(iso + "T00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/** Slug seguro para nome de arquivo. */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);