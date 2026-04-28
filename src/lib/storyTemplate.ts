/* Template fixo do Stories — 1080x1920, identidade visual Fonte de Alegria. */
import {
  ensureFonts,
  drawWrappedText,
  measureWrapped,
  canvasToBlob,
  formatDataLonga,
} from "./canvasUtils";

export interface StoryParams {
  data: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  hook: string;
}

const W = 1080;
const H = 1920;

/* Cores em hex (extraídas do design system HSL do projeto) */
const COLOR_LIGHT_TOP = "#FFE9C7"; // creme dourado
const COLOR_CORAL = "#F1684E";
const COLOR_CORAL_DEEP = "#D5482E";
const COLOR_TEAL_DEEP = "#0B3640";
const COLOR_WHITE = "#FFFFFF";

const drawBackground = (ctx: CanvasRenderingContext2D) => {
  // Gradiente vertical sunrise (igual ao do site)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COLOR_LIGHT_TOP);
  grad.addColorStop(0.28, COLOR_CORAL);
  grad.addColorStop(0.62, COLOR_CORAL_DEEP);
  grad.addColorStop(1, COLOR_TEAL_DEEP);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Sol nascente — círculo radiante na base
  const sunY = H - 320;
  const sunR = 380;
  const sunGrad = ctx.createRadialGradient(W / 2, sunY, 30, W / 2, sunY, sunR);
  sunGrad.addColorStop(0, "rgba(255, 240, 200, 0.95)");
  sunGrad.addColorStop(0.4, "rgba(255, 180, 120, 0.55)");
  sunGrad.addColorStop(1, "rgba(255, 150, 100, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(W / 2, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Núcleo do sol
  const coreGrad = ctx.createRadialGradient(W / 2, sunY, 5, W / 2, sunY, 90);
  coreGrad.addColorStop(0, "#FFF8E1");
  coreGrad.addColorStop(1, "rgba(255,230,180,0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(W / 2, sunY, 90, 0, Math.PI * 2);
  ctx.fill();

  // Brilho sutil de textura
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.6;
    const r = Math.random() * 2.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
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

export const renderStoryPNG = async (p: StoryParams): Promise<Blob> => {
  await ensureFonts();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  drawBackground(ctx);

  /* Área segura: 250 topo, 400 base. Conteúdo entre 250-1520. */
  const SAFE_TOP = 250;
  const SAFE_BOTTOM = 400;
  const PADDING_X = 90;
  const CONTENT_W = W - PADDING_X * 2;

  // 1. Etiqueta superior
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 28px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DEVOCIONAL DO DIA", W / 2, SAFE_TOP + 30);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 26px Inter, sans-serif";
  ctx.fillText(formatDataLonga(p.data), W / 2, SAFE_TOP + 70);

  // Pequeno divisor decorativo
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 30, SAFE_TOP + 100);
  ctx.lineTo(W / 2 + 30, SAFE_TOP + 100);
  ctx.stroke();

  // 2. Título — Fraunces grande, centralizado
  ctx.fillStyle = COLOR_WHITE;
  // Tamanho dinâmico conforme tamanho do título
  const titleSize = p.titulo.length > 38 ? 78 : p.titulo.length > 22 ? 96 : 116;
  ctx.font = `700 ${titleSize}px Fraunces, Georgia, serif`;
  const titleY = SAFE_TOP + 200;
  const titleH = measureWrapped(ctx, p.titulo, CONTENT_W, titleSize * 1.05);
  drawWrappedText(ctx, p.titulo, W / 2, titleY + titleSize, CONTENT_W, titleSize * 1.05);

  // 3. Card translúcido com versículo
  const cardY = titleY + titleH + 100;
  ctx.font = "italic 400 38px Fraunces, Georgia, serif";
  const versH = measureWrapped(ctx, `"${p.versiculo}"`, CONTENT_W - 80, 50);
  const cardH = versH + 130;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundedRect(ctx, PADDING_X, cardY, CONTENT_W, cardH, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLOR_WHITE;
  ctx.font = "italic 400 38px Fraunces, Georgia, serif";
  drawWrappedText(
    ctx, `"${p.versiculo}"`,
    W / 2, cardY + 60,
    CONTENT_W - 80, 50,
  );
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 26px Inter, sans-serif";
  ctx.fillText(`— ${p.referencia}`, W / 2, cardY + cardH - 30);

  // 4. Hook (CTA inspirador) — acima do rodapé, dentro da zona segura
  const hookY = H - SAFE_BOTTOM - 240;
  ctx.fillStyle = COLOR_WHITE;
  ctx.font = "600 38px Inter, sans-serif";
  drawWrappedText(ctx, p.hook, W / 2, hookY, CONTENT_W, 52);

  // 5. Rodapé fixo
  const footY = H - SAFE_BOTTOM - 60;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 30px Inter, sans-serif";
  ctx.fillText("fontedealegria.com", W / 2, footY);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 26px Inter, sans-serif";
  ctx.fillText("@fontedealegriadiaria", W / 2, footY + 40);

  return canvasToBlob(canvas);
};