/* Renderer Canvas2D nativo dos 7 slides do carrossel.
   Mesma linguagem visual do componente React `SlideCanvas.tsx`,
   mas vetorial via Canvas → PNG nítido (substitui html2canvas). */

import {
  C,
  CarrosselData,
  TOTAL_SLIDES,
  formatDataCurta,
  padSlide,
  parseHighlight,
} from "./carrosselSlides";
import {
  ensureFonts,
  wrapLines,
  measureWrapped,
  drawWrappedText,
  canvasToBlob,
} from "./canvasUtils";

const W = 1080;
const H = 1080;

const fr = (size: number, weight = 700, italic = true) =>
  `${italic ? "italic " : ""}${weight} ${size}px Fraunces, Georgia, serif`;
const sans = (size: number, weight = 700) =>
  `${weight} ${size}px Inter, system-ui, sans-serif`;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function pill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  bg: string, fg: string,
  opts: { border?: string; fontSize?: number; padX?: number; padY?: number; align?: "left" | "right" } = {},
) {
  const fontSize = opts.fontSize ?? 22;
  const padX = opts.padX ?? 28;
  const padY = opts.padY ?? 14;
  ctx.font = sans(fontSize, 800);
  // letter-spacing manual via string upper
  const label = text.toUpperCase();
  // emulate letter spacing 0.18em
  const ls = fontSize * 0.18;
  const chars = [...label];
  const w = chars.reduce((acc, c) => acc + ctx.measureText(c).width, 0) + ls * (chars.length - 1);
  const h = fontSize + padY * 2;
  const drawX = opts.align === "right" ? x - (w + padX * 2) : x;
  ctx.fillStyle = bg;
  roundedRect(ctx, drawX, y, w + padX * 2, h, 999);
  ctx.fill();
  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  let cx = drawX + padX;
  for (const c of chars) {
    ctx.fillText(c, cx, y + h / 2 + 1);
    cx += ctx.measureText(c).width + ls;
  }
  ctx.textBaseline = "alphabetic";
  return { x: drawX, y, w: w + padX * 2, h };
}

/** Encontra fontSize que cabe num bloco (largura, altura). */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  buildFont: (s: number) => string,
  sizes: number[],
  maxWidth: number,
  maxHeight: number,
  lineRatio = 1.15,
) {
  for (const s of sizes) {
    ctx.font = buildFont(s);
    const h = measureWrapped(ctx, text, maxWidth, s * lineRatio);
    if (h <= maxHeight) return { size: s, height: h };
  }
  const s = sizes[sizes.length - 1];
  ctx.font = buildFont(s);
  return { size: s, height: measureWrapped(ctx, text, maxWidth, s * lineRatio) };
}

function sunMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * size * 0.36, cy + Math.sin(a) * size * 0.36);
    ctx.lineTo(cx + Math.cos(a) * size * 0.5, cy + Math.sin(a) * size * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function brandFooter(ctx: CanvasRenderingContext2D, dark: boolean) {
  const color = dark ? C.goldSoft : C.tealDeep;
  const sun = dark ? C.gold : C.coralDeep;
  sunMark(ctx, 60 + 14, H - 48 - 14, 28, sun);
  ctx.fillStyle = color;
  ctx.font = fr(26, 700, true);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Fonte de Alegria", 60 + 42, H - 48);
  ctx.textBaseline = "alphabetic";
}

function counter(ctx: CanvasRenderingContext2D, index: number, dark: boolean) {
  const text = padSlide(index);
  ctx.font = sans(20, 700);
  const w = ctx.measureText(text).width + 36;
  const h = 44;
  const x = W - 56 - w;
  const y = 56;
  ctx.fillStyle = dark ? "rgba(255,255,255,0.14)" : "rgba(15,68,81,0.10)";
  roundedRect(ctx, x, y, w, h, 999);
  ctx.fill();
  ctx.strokeStyle = dark ? "rgba(244,192,77,0.65)" : "rgba(15,68,81,0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = dark ? C.gold : C.tealDeep;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
}

/* ===================== SLIDES ===================== */

function drawSlide1(ctx: CanvasRenderingContext2D, d: CarrosselData) {
  // gradient sunrise
  const grad = ctx.createRadialGradient(W / 2, H * 1.1, 0, W / 2, H * 1.1, H * 1.1);
  grad.addColorStop(0, C.gold);
  grad.addColorStop(0.35, C.coral);
  grad.addColorStop(0.7, C.coralDeep);
  grad.addColorStop(1, C.coralDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // anéis solares
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 3;
  for (const r of [120, 180, 240, 320, 410]) {
    ctx.beginPath();
    ctx.arc(W - 50, 80, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const dataLabel = formatDataCurta(d.data);
  pill(ctx, `Devocional${dataLabel ? ` · ${dataLabel}` : ""}`, 60, 56, C.gold, C.tealDeep);

  // Texto do gancho
  const text = d.gancho || "Sua pergunta provocadora aqui.";
  const isShort = text.length <= 38;
  const sizes = isShort ? [124, 110, 96, 82, 70] : [96, 84, 74, 66, 58];
  const fit = fitFont(
    ctx, text,
    (s) => fr(s, 900, true),
    sizes,
    W - 120,
    640,
    1.05,
  );
  ctx.fillStyle = C.cream;
  ctx.font = fr(fit.size, 900, true);
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 6;
  drawWrappedText(ctx, text, 60, 230 + fit.size, W - 120, fit.size * 1.05, "left");
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // CTA inferior direito
  ctx.fillStyle = C.cream;
  ctx.font = sans(22, 700);
  ctx.textAlign = "right";
  ctx.fillText("Deslize  →", W - 60, H - 60);
}

function drawSlide2(ctx: CanvasRenderingContext2D, d: CarrosselData) {
  ctx.fillStyle = C.sand;
  ctx.fillRect(0, 0, W, H);
  // bloco coral diagonal direita
  ctx.fillStyle = C.coral;
  ctx.beginPath();
  ctx.moveTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(W * 0.55, H);
  ctx.lineTo(W * 0.72, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.moveTo(W, 0);
  ctx.lineTo(W, H * 0.18);
  ctx.lineTo(W * 0.78, 0);
  ctx.closePath();
  ctx.fill();

  pill(ctx, "Onde você está", 60, 200, C.tealDeep, C.gold);

  const text = d.contexto || "Descreva o cenário do leitor aqui.";
  const fit = fitFont(
    ctx, text,
    (s) => fr(s, 700, true),
    [64, 56, 50, 44, 38],
    W * 0.78 - 60,
    540,
    1.18,
  );
  ctx.fillStyle = C.tealDeep;
  ctx.font = fr(fit.size, 700, true);
  ctx.textAlign = "left";
  drawWrappedText(ctx, text, 60, 290 + fit.size, W * 0.78 - 60, fit.size * 1.18, "left");
}

function drawSlide3(ctx: CanvasRenderingContext2D, d: CarrosselData) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, C.teal);
  grad.addColorStop(0.6, C.tealDeep);
  grad.addColorStop(1, C.tealInk);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // halo solar canto sup esq
  const halo = ctx.createRadialGradient(50, 50, 0, 50, 50, 500);
  halo.addColorStop(0, "rgba(244,192,77,0.30)");
  halo.addColorStop(1, "rgba(244,192,77,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  pill(ctx, "Palavra de hoje", 60, 200, C.gold, C.tealDeep);

  // card
  const cx = 80, cy = 320, cw = W - 160;
  const text = d.versiculo || "O versículo aparece aqui.";
  const fit = fitFont(
    ctx, text,
    (s) => fr(s, 400, true),
    [44, 40, 36, 32, 28, 24],
    cw - 112,
    430,
    1.45,
  );
  const ch = Math.max(360, fit.height + 220);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundedRect(ctx, cx, cy, cw, ch, 28);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  // aspas
  ctx.fillStyle = C.gold;
  ctx.font = fr(120, 400, true);
  ctx.textAlign = "left";
  ctx.fillText("“", cx + 56, cy + 100);

  ctx.fillStyle = C.cream;
  ctx.font = fr(fit.size, 400, true);
  drawWrappedText(ctx, text, cx + 56, cy + 140 + fit.size, cw - 112, fit.size * 1.45, "left");

  // ref pill bottom-right
  pill(ctx, d.referencia || "Livro 1:1", cx + cw - 32, cy + ch - 70, C.gold, C.tealDeep, { align: "right", fontSize: 20 });
}

function drawSlide4(ctx: CanvasRenderingContext2D, d: CarrosselData) {
  ctx.fillStyle = C.coralDeep;
  ctx.fillRect(0, 0, W, H);
  // bloco areia diagonal inferior esquerda
  ctx.fillStyle = C.sand;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H * 0.78);
  ctx.lineTo(W * 0.45, H);
  ctx.closePath();
  ctx.fill();

  // aspas decorativas
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = C.gold;
  ctx.font = fr(380, 900, true);
  ctx.textAlign = "left";
  ctx.fillText("“", 30, 360);
  ctx.restore();

  pill(ctx, "Reflexão", 60, 200, C.gold, C.tealDeep);

  // reflexão com highlight
  const raw = d.reflexao || "Sua reflexão com uma *palavra* destacada.";
  const parts = parseHighlight(raw);
  const flat = parts.map((p) => p.t).join("");
  const fit = fitFont(
    ctx, flat,
    (s) => fr(s, 700, true),
    [62, 56, 50, 44, 38, 34],
    W - 120,
    580,
    1.22,
  );

  // Para destacar, redesenhamos linha-a-linha: como é complexo posicionar palavras
  // específicas, fazemos um layout simples (palavras sequenciais).
  ctx.font = fr(fit.size, 700, true);
  const lh = fit.size * 1.22;
  const maxW = W - 120;
  const x0 = 60;
  let y = 300 + fit.size;

  // Constrói tokens (palavra, h?)
  const tokens: { t: string; h?: boolean }[] = [];
  for (const p of parts) {
    const words = p.t.split(/(\s+)/); // mantém espaços
    for (const w of words) {
      if (!w) continue;
      tokens.push({ t: w, h: p.h });
    }
  }
  // Quebra em linhas
  type Tok = { t: string; h?: boolean; w: number };
  const lines: Tok[][] = [[]];
  let lineW = 0;
  for (const tk of tokens) {
    const w = ctx.measureText(tk.t).width;
    if (lineW + w > maxW && lines[lines.length - 1].length > 0) {
      lines.push([]);
      lineW = 0;
    }
    lines[lines.length - 1].push({ ...tk, w });
    lineW += w;
  }

  for (const line of lines) {
    let x = x0;
    for (const tk of line) {
      if (tk.h) {
        ctx.fillStyle = C.gold;
        ctx.fillText(tk.t, x, y);
        // sublinhado
        const trimmed = tk.t.trimEnd();
        const tw = ctx.measureText(trimmed).width;
        ctx.fillRect(x, y + 10, tw, 4);
      } else {
        ctx.fillStyle = C.cream;
        ctx.fillText(tk.t, x, y);
      }
      x += tk.w;
    }
    y += lh;
  }
}

function drawSlide5(ctx: CanvasRenderingContext2D, d: CarrosselData) {
  ctx.fillStyle = C.sand;
  ctx.fillRect(0, 0, W, H);

  pill(ctx, "Para hoje", 60, 200, C.coral, C.cream);

  const items = (d.aplicacao || "Ação 1\nAção 2\nAção 3")
    .split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3);

  const styles = [
    { bg: C.coral, fg: C.cream, num: C.gold },
    { bg: C.tealDeep, fg: C.cream, num: C.gold },
    { bg: C.gold, fg: C.tealDeep, num: C.coralDeep },
  ];

  const cardX = 60;
  const cardW = W - 120;
  const cardH = 180;
  let y = 320;
  items.forEach((it, i) => {
    const s = styles[i] ?? styles[0];
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = s.bg;
    roundedRect(ctx, cardX, y, cardW, cardH, 24);
    ctx.fill();
    ctx.restore();

    // número
    ctx.fillStyle = s.num;
    ctx.font = fr(96, 900, true);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1).padStart(2, "0"), cardX + 40, y + cardH / 2);

    // texto
    ctx.fillStyle = s.fg;
    ctx.font = sans(32, 700);
    const tx = cardX + 40 + 140;
    const tw = cardW - (40 + 140) - 30;
    // fit a 1-2 linhas
    const fit = fitFont(ctx, it, (sz) => sans(sz, 700), [32, 28, 26, 24], tw, cardH - 40, 1.25);
    ctx.font = sans(fit.size, 700);
    drawWrappedText(ctx, it, tx, y + cardH / 2 - fit.height / 2 + fit.size, tw, fit.size * 1.25, "left");

    ctx.textBaseline = "alphabetic";
    y += cardH + 22;
  });
}

function drawSlide6(ctx: CanvasRenderingContext2D, d: CarrosselData) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, C.coral);
  grad.addColorStop(0.5, C.gold);
  grad.addColorStop(1, C.teal);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  pill(ctx, "Pense nisso", 60, 200, C.tealDeep, C.gold);

  const text = d.pergunta || "Sua pergunta de fechamento aqui.";
  const fit = fitFont(ctx, text, (s) => fr(s, 900, true), [80, 72, 64, 56, 48], W - 120, 540, 1.1);
  ctx.fillStyle = C.cream;
  ctx.font = fr(fit.size, 900, true);
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.20)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  drawWrappedText(ctx, text, 60, 290 + fit.size, W - 120, fit.size * 1.1, "left");
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // pílulas CTA
  let x = 60;
  const y = H - 180;
  for (const t of ["🔖 Salve", "💬 Comente", "↗ Compartilhe"]) {
    const r = pill(ctx, t, x, y, C.cream, C.tealDeep, { fontSize: 16 });
    x += r.w + 12;
  }
}

function drawSlide7(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, C.tealDeep);
  grad.addColorStop(1, C.tealInk);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // anéis solares grandes canto inf-direito
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 3;
  for (const r of [120, 180, 250, 330]) {
    ctx.beginPath();
    ctx.arc(W + 50, H + 100, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.arc(W + 50, H + 100, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  pill(ctx, "O texto completo te espera", 60, 200, C.coral, C.cream);

  // título
  ctx.fillStyle = C.cream;
  ctx.font = fr(76, 900, true);
  ctx.textAlign = "left";
  drawWrappedText(ctx, "Leia o devocional", 60, 350, W * 0.85, 76 * 1.05, "left");
  ctx.fillStyle = C.gold;
  drawWrappedText(ctx, "completo.", 60, 350 + 76 * 1.1, W * 0.85, 76 * 1.05, "left");

  // botão URL
  ctx.font = sans(32, 800);
  const label = "fontedealegria.com.br";
  const padX = 36, padY = 22;
  const btnW = ctx.measureText(label).width + padX * 2;
  const btnH = 32 + padY * 2;
  const btnX = 60, btnY = H - 280;
  ctx.save();
  ctx.shadowColor = "rgba(213,72,46,0.55)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = C.coral;
  roundedRect(ctx, btnX, btnY, btnW, btnH, 999);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.cream;
  ctx.textBaseline = "middle";
  ctx.fillText(label, btnX + padX, btnY + btnH / 2);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = C.goldSoft;
  ctx.font = sans(26, 700);
  ctx.fillText("@fontedealegriadiaria", 60, btnY + btnH + 50);

  ctx.fillStyle = "rgba(255,246,232,0.85)";
  ctx.font = sans(20, 500);
  ctx.fillText("Toque no link da bio →", 60, btnY + btnH + 86);
}

/* ===================== ENTRY ===================== */

const isDark = (i: number) => i === 1 || i === 3 || i === 4 || i === 6 || i === 7;

export async function renderSlidePNG(data: CarrosselData, index: number): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  switch (index) {
    case 1: drawSlide1(ctx, data); break;
    case 2: drawSlide2(ctx, data); break;
    case 3: drawSlide3(ctx, data); break;
    case 4: drawSlide4(ctx, data); break;
    case 5: drawSlide5(ctx, data); break;
    case 6: drawSlide6(ctx, data); break;
    case 7: drawSlide7(ctx); break;
  }

  // chrome (selo + assinatura)
  counter(ctx, index, isDark(index));
  brandFooter(ctx, isDark(index));

  return canvasToBlob(canvas);
}

export const SLIDES_TOTAL = TOTAL_SLIDES;