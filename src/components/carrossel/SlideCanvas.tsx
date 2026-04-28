import { useEffect } from "react";
import { CarrosselData, padSlide, parseHighlight } from "@/lib/carrosselSlides";

/**
 * SLIDE 1080x1080 — design tokens hardcoded (post-brand, not app-brand).
 * Renders a single slide. Caller wraps it in a transform: scale() container
 * for preview. For PNG export, render at scale 1.
 */

const C = {
  bg: "#0E0F0D",
  primary: "#F0EDE8",
  secondary: "#9A9490",
  ghost: "#3A3530",
  gold: "#C8963A",
  coral: "#C4533A",
  refText: "#6B6560",
  muted: "#4A4540",
  divider: "#1E1E1C",
  verseRule: "#2A2520",
};

const FRAUNCES_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,700&display=swap";

let fontInjected = false;
function useFraunces() {
  useEffect(() => {
    if (fontInjected) return;
    if (typeof document === "undefined") return;
    if (document.querySelector(`link[href="${FRAUNCES_HREF}"]`)) {
      fontInjected = true;
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FRAUNCES_HREF;
    document.head.appendChild(link);
    fontInjected = true;
  }, []);
}

const fraunces = `'Fraunces', Georgia, serif`;
const inter = `'Inter', system-ui, sans-serif`;
const mono = `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;

const labelStyle: React.CSSProperties = {
  fontFamily: inter,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: C.gold,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={labelStyle}>{children}</div>;
}

function Divider({ color = C.divider, mt = 12 }: { color?: string; mt?: number }) {
  return <div style={{ height: 1, background: color, marginTop: mt }} />;
}

export interface SlideCanvasProps {
  data: CarrosselData;
  index: number; // 1..7
}

export const SLIDE_SIZE = 1080;

export function SlideCanvas({ data, index }: SlideCanvasProps) {
  useFraunces();

  return (
    <div
      data-slide-index={index}
      style={{
        position: "relative",
        width: SLIDE_SIZE,
        height: SLIDE_SIZE,
        background: C.bg,
        color: C.primary,
        fontFamily: inter,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Accent rule */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 72,
          width: 44,
          height: 2,
          background: C.gold,
        }}
      />

      {/* Brand mark */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 72,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontSize: 13,
          color: C.ghost,
        }}
      >
        Fonte de Alegria
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          right: 72,
          fontFamily: mono,
          fontSize: 13,
          color: C.muted,
        }}
      >
        {padSlide(index)}
      </div>

      {/* Content per slide */}
      <Slide1 data={data} active={index === 1} />
      {index === 2 && <Slide2 data={data} />}
      {index === 3 && <Slide3 data={data} />}
      {index === 4 && <Slide4 data={data} />}
      {index === 5 && <Slide5 data={data} />}
      {index === 6 && <Slide6 data={data} />}
      {index === 7 && <Slide7 />}
    </div>
  );
}

/* ============== SLIDE 1 — GANCHO ============== */
function Slide1({ data, active }: { data: CarrosselData; active: boolean }) {
  if (!active) return null;
  const text = data.gancho || "Sua pergunta provocadora aqui.";
  const isShort = text.length <= 40;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 192, // 72 + 120
          left: 72,
          right: 72,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: isShort ? 88 : 76,
          lineHeight: 1.1,
          color: C.gold,
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: 72,
          fontFamily: inter,
          fontSize: 14,
          color: C.muted,
        }}
      >
        Deslize para ler →
      </div>
    </>
  );
}

/* ============== SLIDE 2 — CONTEXTO ============== */
function Slide2({ data }: { data: CarrosselData }) {
  return (
    <div style={{ position: "absolute", top: 192, left: 72, right: 72 }}>
      <SectionLabel>Contexto</SectionLabel>
      <Divider />
      <div
        style={{
          marginTop: 48,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontSize: 58,
          lineHeight: 1.2,
          color: C.primary,
        }}
      >
        {data.contexto || "Descreva o cenário do leitor aqui."}
      </div>
    </div>
  );
}

/* ============== SLIDE 3 — PALAVRA DE HOJE ============== */
function Slide3({ data }: { data: CarrosselData }) {
  return (
    <div style={{ position: "absolute", top: 192, left: 72, right: 72 }}>
      <SectionLabel>Palavra de hoje</SectionLabel>
      <div
        style={{
          marginTop: 60,
          paddingLeft: 28,
          borderLeft: `3px solid ${C.gold}`,
        }}
      >
        <div style={{ height: 1, background: C.verseRule }} />
        <div
          style={{
            marginTop: 32,
            marginBottom: 32,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontSize: 34,
            lineHeight: 1.65,
            color: C.primary,
          }}
        >
          {data.versiculo || "O versículo aparece aqui."}
        </div>
        <div style={{ height: 1, background: C.verseRule }} />
        <div
          style={{
            marginTop: 16,
            fontFamily: mono,
            fontSize: 18,
            color: C.refText,
          }}
        >
          {data.referencia || "Livro 1:1"}
        </div>
      </div>
    </div>
  );
}

/* ============== SLIDE 4 — REFLEXÃO ============== */
function Slide4({ data }: { data: CarrosselData }) {
  const parts = parseHighlight(data.reflexao || "Sua reflexão com uma *palavra* destacada.");
  return (
    <div style={{ position: "absolute", top: 192, left: 72, right: 72 }}>
      <SectionLabel>Reflexão</SectionLabel>
      <Divider />
      <div
        style={{
          marginTop: 48,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontSize: 52,
          lineHeight: 1.25,
          color: C.primary,
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={p.h ? { color: C.gold } : undefined}>
            {p.t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============== SLIDE 5 — PARA HOJE ============== */
function Slide5({ data }: { data: CarrosselData }) {
  const items = (data.aplicacao || "Ação 1\nAção 2\nAção 3")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  return (
    <div style={{ position: "absolute", top: 192, left: 72, right: 72 }}>
      <SectionLabel>Para hoje</SectionLabel>
      <Divider />
      <ul style={{ listStyle: "none", padding: 0, margin: "56px 0 0 0" }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 16,
              fontFamily: inter,
              fontSize: 30,
              lineHeight: 1.7,
              color: C.primary,
              marginBottom: i === items.length - 1 ? 0 : 20,
            }}
          >
            <span style={{ color: C.gold }}>—</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============== SLIDE 6 — PENSE NISSO ============== */
function Slide6({ data }: { data: CarrosselData }) {
  return (
    <div style={{ position: "absolute", top: 192, left: 72, right: 72 }}>
      <SectionLabel>Pense nisso</SectionLabel>
      <Divider />
      <div
        style={{
          marginTop: 56,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 64,
          lineHeight: 1.18,
          color: C.primary,
        }}
      >
        {data.pergunta || "Sua pergunta de fechamento aqui."}
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: inter,
          fontSize: 13,
          color: C.refText,
        }}
      >
        Salve para não esquecer — 🔖
      </div>
    </div>
  );
}

/* ============== SLIDE 7 — CTA ============== */
function Slide7() {
  return (
    <div style={{ position: "absolute", top: 192, left: 72, right: 72 }}>
      <div
        style={{
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.2,
          color: C.gold,
        }}
      >
        Leia o devocional completo
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: mono,
          fontSize: 20,
          color: C.primary,
        }}
      >
        fontedealegria.com.br
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: mono,
          fontSize: 16,
          color: C.secondary,
        }}
      >
        @fontedealegriadiaria
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: inter,
          fontSize: 16,
          color: C.muted,
        }}
      >
        Compartilhe com quem precisa ouvir isso hoje.
      </div>
    </div>
  );
}