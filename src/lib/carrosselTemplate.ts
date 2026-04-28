/* Template do carrossel — 7 slides 1080x1350, identidade Fonte de Alegria. */
import JSZip from "jszip";
import {
  ensureFonts,
  drawWrappedText,
  measureWrapped,
  canvasToBlob,
  slugify,
} from "./canvasUtils";

export interface CarrosselSlides {
  hook: string;
  tensao_1: string;
  tensao_2: string;
  versiculo_destaque: string;
  versiculo_referencia: string;
  aplicacao_1: string;
  aplicacao_2: string;
  cta: string;
}

const W = 1080;
const H = 1350;

const C = {
  cream: "#FBF1DC",
  creamDark: "#F3E1B8",
  coral: "#F1684E",
  coralDeep: "#D5482E",
  teal: "#0F4451",
  tealDeep: "#0B3640",
  white: "#FFFFFF",
  gold: "#F4C04D",
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

const drawHeader = (
  ctx: CanvasRenderingContext2D,
  fg: string,
  num: number,
) => {
  ctx.fillStyle = fg;
  ctx.font = "700 24px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FONTE DE ALEGRIA", 60, 70);
  ctx.textAlign = "right";
  ctx.font = "500 22px Inter, sans-serif";
  ctx.fillText(`${num} / 7`, W - 60, 70);
};

const drawFooterHandle = (ctx: CanvasRenderingContext2D, fg: string) => {
  ctx.fillStyle = fg;
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("@fontedealegriadiaria", W / 2, H - 50);
};

const drawCreamBg = (ctx: CanvasRenderingContext2D) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.cream);
  g.addColorStop(1, C.creamDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Detalhe coral
  ctx.fillStyle = C.coral;
  ctx.fillRect(0, H - 12, W, 12);
};

const drawCoralBg = (ctx: CanvasRenderingContext2D) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#FFB48E");
  g.addColorStop(0.5, C.coral);
  g.addColorStop(1, C.coralDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
};

const drawTealBg = (ctx: CanvasRenderingContext2D) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.teal);
  g.addColorStop(1, C.tealDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Estrelas/pontos sutis
  ctx.fillStyle = "rgba(244,192,77,0.5)";
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawSunriseBg = (ctx: CanvasRenderingContext2D) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#FFE2B6");
  g.addColorStop(0.45, C.coral);
  g.addColorStop(0.85, C.coralDeep);
  g.addColorStop(1, C.tealDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sg = ctx.createRadialGradient(W / 2, H - 200, 30, W / 2, H - 200, 350);
  sg.addColorStop(0, "rgba(255,240,200,0.85)");
  sg.addColorStop(1, "rgba(255,150,100,0)");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(W / 2, H - 200, 350, 0, Math.PI * 2);
  ctx.fill();
};

/* ---------- Slides individuais ---------- */

const slide1 = (ctx: CanvasRenderingContext2D, hook: string) => {
  drawCoralBg(ctx);
  drawHeader(ctx, "rgba(255,255,255,0.85)", 1);

  // Pequena etiqueta
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DEVOCIONAL DO DIA", W / 2, 200);

  // Hook gigante
  ctx.fillStyle = C.white;
  const size = hook.length > 70 ? 70 : hook.length > 50 ? 84 : 100;
  ctx.font = `700 ${size}px Fraunces, Georgia, serif`;
  const hookH = measureWrapped(ctx, hook, W - 140, size * 1.1);
  drawWrappedText(ctx, hook, W / 2, (H - hookH) / 2 + size, W - 140, size * 1.1);

  // Indicador de "arraste"
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "500 24px Inter, sans-serif";
  ctx.fillText("arrasta →", W / 2, H - 110);
  drawFooterHandle(ctx, "rgba(255,255,255,0.7)");
};

const slideTexto = (
  ctx: CanvasRenderingContext2D,
  num: number,
  texto: string,
  rotulo: string,
) => {
  drawCreamBg(ctx);
  drawHeader(ctx, C.tealDeep, num);

  ctx.fillStyle = C.coralDeep;
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(rotulo, W / 2, 220);

  // Linha sob rótulo
  ctx.strokeStyle = C.coral;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 30, 240);
  ctx.lineTo(W / 2 + 30, 240);
  ctx.stroke();

  ctx.fillStyle = C.tealDeep;
  const size = texto.length > 160 ? 44 : texto.length > 100 ? 52 : 60;
  ctx.font = `600 ${size}px Fraunces, Georgia, serif`;
  const textoH = measureWrapped(ctx, texto, W - 140, size * 1.25);
  drawWrappedText(ctx, texto, W / 2, (H - textoH) / 2 + size, W - 140, size * 1.25);

  drawFooterHandle(ctx, "rgba(11,54,64,0.55)");
};

const slideVersiculo = (
  ctx: CanvasRenderingContext2D,
  versiculo: string,
  referencia: string,
) => {
  drawTealBg(ctx);
  drawHeader(ctx, "rgba(244,192,77,0.85)", 4);

  ctx.fillStyle = C.gold;
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PALAVRA", W / 2, 220);

  ctx.fillStyle = C.white;
  const size = versiculo.length > 140 ? 50 : versiculo.length > 80 ? 58 : 68;
  ctx.font = `italic 400 ${size}px Fraunces, Georgia, serif`;
  const vH = measureWrapped(ctx, `"${versiculo}"`, W - 140, size * 1.2);
  const startY = (H - vH) / 2 + size;
  drawWrappedText(ctx, `"${versiculo}"`, W / 2, startY, W - 140, size * 1.2);

  ctx.fillStyle = C.gold;
  ctx.font = "600 30px Inter, sans-serif";
  ctx.fillText(`— ${referencia}`, W / 2, startY + vH + 50);

  drawFooterHandle(ctx, "rgba(244,192,77,0.7)");
};

const slideCTA = (ctx: CanvasRenderingContext2D, cta: string) => {
  drawSunriseBg(ctx);
  drawHeader(ctx, "rgba(255,255,255,0.85)", 7);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LEVA ISSO COM VOCÊ", W / 2, 200);

  ctx.fillStyle = C.white;
  const size = cta.length > 80 ? 56 : 68;
  ctx.font = `700 ${size}px Fraunces, Georgia, serif`;
  const ctaH = measureWrapped(ctx, cta, W - 140, size * 1.15);
  drawWrappedText(ctx, cta, W / 2, 320 + size, W - 140, size * 1.15);

  // Três pílulas de ação
  const acts = ["Compartilhe", "Envie", "Salve"];
  const py = 320 + ctaH + 140;
  const pillW = 280;
  const gap = 30;
  const totalW = pillW * 3 + gap * 2;
  let px = (W - totalW) / 2;
  for (const a of acts) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    roundedRect(ctx, px, py, pillW, 90, 45);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = C.white;
    ctx.font = "600 30px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(a, px + pillW / 2, py + 58);
    px += pillW + gap;
  }

  // Handle gigante final
  ctx.fillStyle = C.white;
  ctx.font = "700 36px Inter, sans-serif";
  ctx.fillText("@fontedealegriadiaria", W / 2, H - 90);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 22px Inter, sans-serif";
  ctx.fillText("fontedealegria.com", W / 2, H - 50);
};

/* ---------- Renderização completa ---------- */

const newCanvas = () => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  return { c, ctx };
};

export const renderCarrosselZIP = async (
  slides: CarrosselSlides,
  legenda: string,
  tituloDevocional: string,
): Promise<Blob> => {
  await ensureFonts();
  const zip = new JSZip();

  const renderers: Array<(ctx: CanvasRenderingContext2D) => void> = [
    (ctx) => slide1(ctx, slides.hook),
    (ctx) => slideTexto(ctx, 2, slides.tensao_1, "PARA PENSAR"),
    (ctx) => slideTexto(ctx, 3, slides.tensao_2, "RESPIRA"),
    (ctx) =>
      slideVersiculo(ctx, slides.versiculo_destaque, slides.versiculo_referencia),
    (ctx) => slideTexto(ctx, 5, slides.aplicacao_1, "PARA HOJE"),
    (ctx) => slideTexto(ctx, 6, slides.aplicacao_2, "MAIS FUNDO"),
    (ctx) => slideCTA(ctx, slides.cta),
  ];

  for (let i = 0; i < renderers.length; i++) {
    const { c, ctx } = newCanvas();
    renderers[i](ctx);
    const blob = await canvasToBlob(c);
    zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, blob);
  }

  zip.file("legenda.txt", legenda);

  return zip.generateAsync({ type: "blob" });
};

export const carrosselFileName = (data: string, titulo: string) =>
  `carrossel-${data}-${slugify(titulo)}.zip`;

export const storyFileName = (data: string, titulo: string) =>
  `story-${data}-${slugify(titulo)}.png`;