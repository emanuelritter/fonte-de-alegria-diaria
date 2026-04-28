/* Template do Stories — 1080x1920, identidade Fonte de Alegria.
   Layout sequencial com altura medida + auto-shrink para nunca sobrepor. */
import {
  ensureFonts,
  drawWrappedText,
  measureWrapped,
  wrapLines,
  canvasToBlob,
  formatDataLonga,
  loadImage,
} from "./canvasUtils";
import sunIconUrl from "@/assets/sun-icon.png";

export interface StoryParams {
  data: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  hook: string;
}

const W = 1080;
const H = 1920;

const COLOR = {
  cream: "#FFE9C7",
  coral: "#F1684E",
  coralDeep: "#D5482E",
  teal: "#0F4451",
  tealDeep: "#0B3640",
  gold: "#F4C04D",
  goldSoft: "#FFD77A",
  white: "#FFFFFF",
};

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const drawBackground = (ctx: CanvasRenderingContext2D, sunImg: HTMLImageElement | null) => {
  // Bloco coral sólido (topo ~70%)
  ctx.fillStyle = COLOR.coral;
  ctx.fillRect(0, 0, W, H);

  // Bloco teal sólido na base com diagonal
  const splitY = H * 0.72;
  ctx.fillStyle = COLOR.tealDeep;
  ctx.beginPath();
  ctx.moveTo(0, splitY + 80);
  ctx.lineTo(W, splitY - 60);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Faixa coral-deep sutil sobre o bloco superior (textura de pôster)
  const grad = ctx.createLinearGradient(0, 0, 0, splitY);
  grad.addColorStop(0, "rgba(255, 200, 140, 0.35)");
  grad.addColorStop(1, "rgba(213, 72, 46, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, splitY);

  // Anéis dourados decorativos (canto superior direito)
  ctx.strokeStyle = "rgba(244, 192, 77, 0.55)";
  ctx.lineWidth = 3;
  for (let r = 60; r <= 200; r += 35) {
    ctx.beginPath();
    ctx.arc(W - 80, 220, r, -Math.PI / 2, Math.PI);
    ctx.stroke();
  }

  // Sol PNG grande, atrás do conteúdo central, com baixa opacidade
  if (sunImg) {
    const size = 720;
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.drawImage(sunImg, (W - size) / 2, splitY - size * 0.55, size, size);
    ctx.restore();

    // Sol pequeno como selo no topo (esquerda da etiqueta)
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(sunImg, W / 2 - 230, 175, 70, 70);
    ctx.restore();
  }

  // Arco dourado fino na base (sob o teal)
  ctx.strokeStyle = "rgba(244, 192, 77, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H + 200, 600, Math.PI, 2 * Math.PI);
  ctx.stroke();
};

/** Calcula o melhor tamanho de fonte para caber em um maxHeight. */
const fitFont = (
  ctx: CanvasRenderingContext2D,
  text: string,
  fontTpl: (size: number) => string,
  sizes: number[],
  maxWidth: number,
  maxHeight: number,
  lineRatio = 1.15,
): { size: number; height: number } => {
  for (const s of sizes) {
    ctx.font = fontTpl(s);
    const h = measureWrapped(ctx, text, maxWidth, s * lineRatio);
    if (h <= maxHeight) return { size: s, height: h };
  }
  const s = sizes[sizes.length - 1];
  ctx.font = fontTpl(s);
  return { size: s, height: measureWrapped(ctx, text, maxWidth, s * lineRatio) };
};

/** Trunca para no máximo N linhas com "…". */
const clampLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string => {
  const lines = wrapLines(ctx, text, maxWidth).filter((l) => l !== "");
  if (lines.length <= maxLines) return text;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 0 && ctx.measureText(last + "…").width > maxWidth) {
    last = last.slice(0, -1);
  }
  kept[maxLines - 1] = last.replace(/[\s,;:.!?-]+$/, "") + "…";
  return kept.join(" ");
};

export const renderStoryPNG = async (p: StoryParams): Promise<Blob> => {
  await ensureFonts();
  let sunImg: HTMLImageElement | null = null;
  try {
    sunImg = await loadImage(sunIconUrl);
  } catch {
    sunImg = null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  drawBackground(ctx, sunImg);

  const PADDING_X = 90;
  const CONTENT_W = W - PADDING_X * 2;

  // ============ RODAPÉ (faixa teal sólida — fixa) ============
  const FOOTER_H = 180;
  const footerY = H - FOOTER_H;
  ctx.fillStyle = "rgba(11, 54, 64, 0.85)";
  ctx.fillRect(0, footerY, W, FOOTER_H);
  // Linha dourada superior
  ctx.fillStyle = COLOR.gold;
  ctx.fillRect(0, footerY, W, 4);

  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.white;
  ctx.font = "700 32px Inter, sans-serif";
  ctx.fillText("fontedealegria.com.br", W / 2, footerY + 70);
  ctx.fillStyle = COLOR.goldSoft;
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("@fontedealegriadiaria", W / 2, footerY + 115);

  // ============ CABEÇALHO (etiqueta + data) ============
  const HEADER_TOP = 240;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 30px Inter, sans-serif";
  ctx.fillText("DEVOCIONAL DO DIA", W / 2, HEADER_TOP);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "400 26px Inter, sans-serif";
  ctx.fillText(formatDataLonga(p.data), W / 2, HEADER_TOP + 42);

  // Divisor dourado
  ctx.strokeStyle = COLOR.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 36, HEADER_TOP + 70);
  ctx.lineTo(W / 2 + 36, HEADER_TOP + 70);
  ctx.stroke();

  // ============ ÁREA DE CONTEÚDO ============
  // Espaço útil entre header e footer
  const CONTENT_TOP = HEADER_TOP + 110; // ~350
  const CONTENT_BOTTOM = footerY - 40;  // ~1700
  const CONTENT_H = CONTENT_BOTTOM - CONTENT_TOP; // ~1350

  // Reservas para hook (CTA) — fixo, no fim do bloco de conteúdo
  const HOOK_MAX_LINES = 2;
  const HOOK_FONT = 36;
  const HOOK_LINE = HOOK_FONT * 1.25;
  ctx.font = `600 ${HOOK_FONT}px Inter, sans-serif`;
  const hookText = clampLines(ctx, p.hook, CONTENT_W, HOOK_MAX_LINES);
  const hookH = measureWrapped(ctx, hookText, CONTENT_W, HOOK_LINE);
  const HOOK_TOP_GAP = 50;

  // Espaço para título + card de versículo
  const blockH = CONTENT_H - hookH - HOOK_TOP_GAP;

  // Título — proporção 35% do bloco
  const titleMaxH = blockH * 0.40;
  const titleFit = fitFont(
    ctx, p.titulo,
    (s) => `700 ${s}px Fraunces, Georgia, serif`,
    [120, 108, 96, 84, 72, 64],
    CONTENT_W, titleMaxH, 1.05,
  );

  // Card versículo — restante
  const cardPadV = 60;
  const cardPadH = 50;
  const refH = 50;
  const titleBottomGap = 60;
  const versMaxH = blockH - titleFit.height - titleBottomGap - cardPadV * 2 - refH;
  const versText = `"${p.versiculo}"`;
  const versFit = fitFont(
    ctx, versText,
    (s) => `italic 400 ${s}px Fraunces, Georgia, serif`,
    [42, 38, 34, 30, 26, 24],
    CONTENT_W - cardPadH * 2, Math.max(120, versMaxH), 1.25,
  );

  // Posicionamento real
  let cy = CONTENT_TOP;

  // Título
  ctx.fillStyle = COLOR.white;
  ctx.font = `700 ${titleFit.size}px Fraunces, Georgia, serif`;
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  drawWrappedText(
    ctx, p.titulo,
    W / 2, cy + titleFit.size,
    CONTENT_W, titleFit.size * 1.05,
  );
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  cy += titleFit.height + titleBottomGap;

  // Card translúcido com versículo
  const cardH = versFit.height + cardPadV * 2 + refH;
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  roundedRect(ctx, PADDING_X, cy, CONTENT_W, cardH, 28);
  ctx.fill();
  ctx.strokeStyle = COLOR.gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLOR.white;
  ctx.font = `italic 400 ${versFit.size}px Fraunces, Georgia, serif`;
  drawWrappedText(
    ctx, versText,
    W / 2, cy + cardPadV + versFit.size,
    CONTENT_W - cardPadH * 2, versFit.size * 1.25,
  );

  ctx.fillStyle = COLOR.goldSoft;
  ctx.font = "600 26px Inter, sans-serif";
  ctx.fillText(`— ${p.referencia}`, W / 2, cy + cardH - 24);

  cy += cardH + HOOK_TOP_GAP;

  // Hook
  ctx.fillStyle = COLOR.white;
  ctx.font = `600 ${HOOK_FONT}px Inter, sans-serif`;
  drawWrappedText(ctx, hookText, W / 2, cy + HOOK_FONT, CONTENT_W, HOOK_LINE);

  return canvasToBlob(canvas);
};