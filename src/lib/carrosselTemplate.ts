/* Carrossel — 7 slides 1080x1350. Estilo geométrico, cores vibrantes. */
import JSZip from "jszip";
import {
  ensureFonts,
  drawWrappedText,
  measureWrapped,
  canvasToBlob,
  loadImage,
  slugify,
} from "./canvasUtils";
import sunIconUrl from "@/assets/sun-icon.png";

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
  coral: "#F1684E",
  coralDeep: "#D5482E",
  teal: "#0F4451",
  tealDeep: "#0B3640",
  gold: "#F4C04D",
  goldDeep: "#E0A52F",
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

/* ---------- Cabeçalho / rodapé compartilhados ---------- */

const drawHeaderBrand = (ctx: CanvasRenderingContext2D, fg: string) => {
  ctx.fillStyle = fg;
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FONTE DE ALEGRIA", 60, 70);
};

const drawNumberPill = (
  ctx: CanvasRenderingContext2D,
  num: number,
  bg: string,
  fg: string,
) => {
  const w = 110;
  const h = 44;
  const x = W - 60 - w;
  const y = 44;
  ctx.fillStyle = bg;
  roundedRect(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${num} / 7`, x + w / 2, y + 30);
};

const drawFooterHandle = (ctx: CanvasRenderingContext2D, fg: string) => {
  ctx.fillStyle = fg;
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("@fontedealegriadiaria", W / 2, H - 50);
};

/* ---------- Backgrounds geométricos ---------- */

const drawCreamGeo = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = C.cream;
  ctx.fillRect(0, 0, W, H);
  // Faixas verticais à esquerda
  ctx.fillStyle = C.coral;
  ctx.fillRect(0, 0, 14, H);
  ctx.fillStyle = C.gold;
  ctx.fillRect(22, 0, 8, H);
  ctx.fillStyle = C.tealDeep;
  ctx.fillRect(36, 0, 4, H);
  // Círculo coral semi-transparente sangrando do canto inferior direito
  ctx.fillStyle = "rgba(241, 104, 78, 0.18)";
  ctx.beginPath();
  ctx.arc(W + 80, H + 60, 480, 0, Math.PI * 2);
  ctx.fill();
  // Pequeno triângulo dourado decorativo no topo direito
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.moveTo(W - 120, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, 120);
  ctx.closePath();
  ctx.fill();
};

const drawSplitHero = (ctx: CanvasRenderingContext2D, sun: HTMLImageElement | null) => {
  // Metade superior coral, inferior teal
  ctx.fillStyle = C.coral;
  ctx.fillRect(0, 0, W, H / 2);
  ctx.fillStyle = C.tealDeep;
  ctx.fillRect(0, H / 2, W, H / 2);
  // Linha dourada divisória
  ctx.fillStyle = C.gold;
  ctx.fillRect(0, H / 2 - 3, W, 6);
  // Círculo dourado gigante (sol estilizado) no centro
  if (sun) {
    const size = 520;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(sun, (W - size) / 2, H / 2 - size / 2, size, size);
    ctx.restore();
  } else {
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 220, 0, Math.PI * 2);
    ctx.fill();
  }
  // Anéis decorativos no canto
  ctx.strokeStyle = "rgba(244,192,77,0.45)";
  ctx.lineWidth = 3;
  for (let r = 50; r <= 160; r += 30) {
    ctx.beginPath();
    ctx.arc(70, 70, r, 0, Math.PI / 2);
    ctx.stroke();
  }
};

const drawTealGeo = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = C.tealDeep;
  ctx.fillRect(0, 0, W, H);
  // Faixa coral fina à direita
  ctx.fillStyle = C.coral;
  ctx.fillRect(W - 14, 0, 14, H);
  // Triângulos dourados decorativos no topo
  ctx.fillStyle = C.gold;
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 80;
    ctx.beginPath();
    ctx.moveTo(x, 130);
    ctx.lineTo(x + 30, 175);
    ctx.lineTo(x - 30, 175);
    ctx.closePath();
    ctx.fill();
  }
  // Triângulos dourados na base (invertidos)
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 80;
    ctx.beginPath();
    ctx.moveTo(x, H - 130);
    ctx.lineTo(x + 30, H - 175);
    ctx.lineTo(x - 30, H - 175);
    ctx.closePath();
    ctx.fill();
  }
};

const drawCoralBlock = (ctx: CanvasRenderingContext2D, sun: HTMLImageElement | null) => {
  ctx.fillStyle = C.coral;
  ctx.fillRect(0, 0, W, H);
  // Faixa teal inferior (~30%)
  const splitY = H * 0.7;
  ctx.fillStyle = C.tealDeep;
  ctx.fillRect(0, splitY, W, H - splitY);
  // Linha dourada
  ctx.fillStyle = C.gold;
  ctx.fillRect(0, splitY - 3, W, 6);
  // Sol grande translúcido como fundo decorativo no topo
  if (sun) {
    const size = 480;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.drawImage(sun, (W - size) / 2, 80, size, size);
    ctx.restore();
  }
};

/* ---------- Helpers ---------- */

const drawLabel = (
  ctx: CanvasRenderingContext2D,
  texto: string,
  y: number,
  cor: string,
) => {
  // letter-spacing simulado: insere espaços entre cada char
  const spaced = texto.split("").join(" ");
  ctx.fillStyle = cor;
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(spaced, W / 2, y);
  // Barra dourada espessa abaixo
  ctx.fillStyle = C.gold;
  roundedRect(ctx, W / 2 - 36, y + 14, 72, 6, 3);
  ctx.fill();
};

/* ---------- Slides ---------- */

const slide1 = (ctx: CanvasRenderingContext2D, hook: string, sun: HTMLImageElement | null) => {
  drawSplitHero(ctx, sun);
  drawHeaderBrand(ctx, "rgba(255,255,255,0.95)");
  drawNumberPill(ctx, 1, C.gold, C.tealDeep);

  // Etiqueta acima do hook
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  const spaced = "DEVOCIONAL DO DIA".split("").join(" ");
  ctx.fillText(spaced, W / 2, 170);

  // Hook gigante centralizado, com leve sombra para contraste sobre o sol
  ctx.fillStyle = C.white;
  const size = hook.length > 70 ? 64 : hook.length > 50 ? 78 : 92;
  ctx.font = `700 ${size}px Fraunces, Georgia, serif`;
  ctx.shadowColor = "rgba(11,54,64,0.45)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  const hookH = measureWrapped(ctx, hook, W - 140, size * 1.1);
  drawWrappedText(ctx, hook, W / 2, (H - hookH) / 2 + size, W - 140, size * 1.1);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Indicador "arrasta"
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
  drawCreamGeo(ctx);
  drawHeaderBrand(ctx, C.tealDeep);
  drawNumberPill(ctx, num, C.coral, C.white);

  drawLabel(ctx, rotulo, 220, C.coralDeep);

  ctx.fillStyle = C.tealDeep;
  const size = texto.length > 160 ? 44 : texto.length > 100 ? 52 : 60;
  ctx.font = `600 ${size}px Fraunces, Georgia, serif`;
  const textoH = measureWrapped(ctx, texto, W - 180, size * 1.25);
  drawWrappedText(ctx, texto, W / 2, (H - textoH) / 2 + size, W - 180, size * 1.25);

  drawFooterHandle(ctx, "rgba(11,54,64,0.55)");
};

const slideVersiculo = (
  ctx: CanvasRenderingContext2D,
  versiculo: string,
  referencia: string,
) => {
  drawTealGeo(ctx);
  drawHeaderBrand(ctx, C.gold);
  drawNumberPill(ctx, 4, C.gold, C.tealDeep);

  drawLabel(ctx, "PALAVRA", 260, C.gold);

  ctx.fillStyle = C.white;
  const size = versiculo.length > 140 ? 48 : versiculo.length > 80 ? 56 : 64;
  ctx.font = `italic 400 ${size}px Fraunces, Georgia, serif`;
  const vH = measureWrapped(ctx, `"${versiculo}"`, W - 180, size * 1.22);
  const startY = (H - vH) / 2 + size;
  drawWrappedText(ctx, `"${versiculo}"`, W / 2, startY, W - 180, size * 1.22);

  ctx.fillStyle = C.gold;
  ctx.font = "700 30px Inter, sans-serif";
  ctx.fillText(`— ${referencia}`, W / 2, startY + vH + 50);

  drawFooterHandle(ctx, "rgba(244,192,77,0.7)");
};

/* Ícones do Instagram desenhados no canvas */

const drawIconShare = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
  // Avião de papel (Send)
  const s = size / 2;
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  // Triângulo externo
  ctx.moveTo(cx - s, cy + s * 0.1);
  ctx.lineTo(cx + s, cy - s);
  ctx.lineTo(cx + s * 0.1, cy + s);
  ctx.lineTo(cx - s * 0.05, cy);
  ctx.closePath();
  ctx.stroke();
  // Linha interna (dobra)
  ctx.beginPath();
  ctx.moveTo(cx - s, cy + s * 0.1);
  ctx.lineTo(cx - s * 0.05, cy);
  ctx.lineTo(cx + s, cy - s);
  ctx.stroke();
};

const drawIconHeart = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
  // Coração contornado (curtir/compartilhar)
  const s = size / 2;
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.85);
  ctx.bezierCurveTo(cx - s * 1.6, cy - s * 0.2, cx - s * 0.7, cy - s * 1.1, cx, cy - s * 0.2);
  ctx.bezierCurveTo(cx + s * 0.7, cy - s * 1.1, cx + s * 1.6, cy - s * 0.2, cx, cy + s * 0.85);
  ctx.closePath();
  ctx.stroke();
};

const drawIconBookmark = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
  // Bookmark/salvar
  const w = size * 0.7;
  const h = size;
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(cx, y + h * 0.7);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.stroke();
};

const drawLogotipo = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sun: HTMLImageElement | null,
) => {
  // Badge do sol (círculo com gradiente coral, igual ao da Navbar)
  const badgeR = 56;
  const badgeX = cx - 220;
  const badgeY = cy;
  const grad = ctx.createLinearGradient(
    badgeX - badgeR, badgeY - badgeR,
    badgeX + badgeR, badgeY + badgeR,
  );
  grad.addColorStop(0, C.coral);
  grad.addColorStop(1, C.gold);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fill();

  if (sun) {
    const s = 70;
    ctx.save();
    ctx.drawImage(sun, badgeX - s / 2, badgeY - s / 2, s, s);
    ctx.restore();
  }

  // Texto "fonte de alegria" estilo Navbar
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = C.white;
  ctx.font = "italic 500 44px Fraunces, Georgia, serif";
  ctx.fillText("fonte de", badgeX + badgeR + 18, badgeY - 4);
  // Mede para posicionar "alegria"
  const w = ctx.measureText("fonte de").width;
  ctx.fillStyle = C.gold;
  ctx.font = "italic 700 48px Fraunces, Georgia, serif";
  ctx.fillText("alegria", badgeX + badgeR + 18 + w + 12, badgeY - 4);
  ctx.textBaseline = "alphabetic";
};

const slideCTA = (ctx: CanvasRenderingContext2D, cta: string, sun: HTMLImageElement | null) => {
  drawCoralBlock(ctx, sun);
  drawHeaderBrand(ctx, "rgba(255,255,255,0.95)");
  drawNumberPill(ctx, 7, C.gold, C.tealDeep);

  drawLabel(ctx, "LEVA ISSO COM VOCE", 200, "rgba(255,255,255,0.95)");

  // CTA texto
  ctx.fillStyle = C.white;
  const size = cta.length > 80 ? 52 : 64;
  ctx.font = `700 ${size}px Fraunces, Georgia, serif`;
  const ctaH = measureWrapped(ctx, cta, W - 160, size * 1.18);
  const ctaY = 320;
  drawWrappedText(ctx, cta, W / 2, ctaY + size, W - 160, size * 1.18);

  // Ícones do Instagram (compartilhar / enviar / salvar)
  const iconSize = 110;
  const gap = 110;
  const iconY = H * 0.78 - 50;
  const totalW = iconSize * 3 + gap * 2;
  let ix = (W - totalW) / 2 + iconSize / 2;
  drawIconHeart(ctx, ix, iconY, iconSize); ix += iconSize + gap;
  drawIconShare(ctx, ix, iconY, iconSize); ix += iconSize + gap;
  drawIconBookmark(ctx, ix, iconY, iconSize);

  // Logotipo "fonte de alegria"
  drawLogotipo(ctx, W / 2, H - 110, sun);

  // Domínio bem pequeno no rodapé
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 20px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("fontedealegria.com.br  ·  @fontedealegriadiaria", W / 2, H - 40);
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
  _tituloDevocional: string,
): Promise<Blob> => {
  await ensureFonts();
  let sun: HTMLImageElement | null = null;
  try {
    sun = await loadImage(sunIconUrl);
  } catch {
    sun = null;
  }

  const zip = new JSZip();

  const renderers: Array<(ctx: CanvasRenderingContext2D) => void> = [
    (ctx) => slide1(ctx, slides.hook, sun),
    (ctx) => slideTexto(ctx, 2, slides.tensao_1, "PARA PENSAR"),
    (ctx) => slideTexto(ctx, 3, slides.tensao_2, "RESPIRA"),
    (ctx) =>
      slideVersiculo(ctx, slides.versiculo_destaque, slides.versiculo_referencia),
    (ctx) => slideTexto(ctx, 5, slides.aplicacao_1, "PARA HOJE"),
    (ctx) => slideTexto(ctx, 6, slides.aplicacao_2, "MAIS FUNDO"),
    (ctx) => slideCTA(ctx, slides.cta, sun),
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