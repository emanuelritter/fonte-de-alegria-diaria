import { useEffect } from "react";
import { C, CarrosselData, formatDataCurta, padSlide, parseHighlight } from "@/lib/carrosselSlides";

/**
 * SLIDE 1080x1080 — paleta solar vibrante.
 * Este componente é apenas para PREVIEW (React/DOM).
 * O export PNG é feito via Canvas2D nativo em src/lib/carrosselCanvas.ts.
 */

const FRAUNCES_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700;1,9..144,900&display=swap";

let fontInjected = false;
function useFraunces() {
  useEffect(() => {
    if (fontInjected || typeof document === "undefined") return;
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

export const SLIDE_SIZE = 1080;

export interface SlideCanvasProps {
  data: CarrosselData;
  index: number; // 1..7
}

export function SlideCanvas({ data, index }: SlideCanvasProps) {
  useFraunces();
  const inner = (() => {
    switch (index) {
      case 1: return <Slide1 data={data} />;
      case 2: return <Slide2 data={data} />;
      case 3: return <Slide3 data={data} />;
      case 4: return <Slide4 data={data} />;
      case 5: return <Slide5 data={data} />;
      case 6: return <Slide6 data={data} />;
      case 7: return <Slide7 />;
      default: return null;
    }
  })();

  return (
    <div
      data-slide-index={index}
      style={{
        position: "relative",
        width: SLIDE_SIZE,
        height: SLIDE_SIZE,
        fontFamily: inter,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {inner}
      <Counter index={index} dark={isDarkSlide(index)} />
      <Brand dark={isDarkSlide(index)} />
    </div>
  );
}

function isDarkSlide(i: number) {
  // slides com fundo escuro (texto claro precisa)
  return i === 1 || i === 3 || i === 4 || i === 6 || i === 7;
}

/* ============== PIECES ============== */

function Counter({ index, dark }: { index: number; dark: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        right: 56,
        padding: "10px 18px",
        borderRadius: 999,
        background: dark ? "rgba(255,255,255,0.14)" : "rgba(15,68,81,0.10)",
        border: `1.5px solid ${dark ? "rgba(244,192,77,0.65)" : "rgba(15,68,81,0.35)"}`,
        color: dark ? C.gold : C.tealDeep,
        fontFamily: inter,
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: "0.12em",
      }}
    >
      {padSlide(index)}
    </div>
  );
}

function Brand({ dark }: { dark: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: fraunces,
        fontStyle: "italic",
        fontSize: 22,
        fontWeight: 700,
        color: dark ? C.goldSoft : C.tealDeep,
      }}
    >
      <SunMark size={28} color={dark ? C.gold : C.coralDeep} />
      Fonte de Alegria
    </div>
  );
}

function SunMark({ size = 28, color = C.gold }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="6" fill={color} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 16 + Math.cos(a) * 10;
        const y1 = 16 + Math.sin(a) * 10;
        const x2 = 16 + Math.cos(a) * 14;
        const y2 = 16 + Math.sin(a) * 14;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function Pill({
  children, bg, fg, border,
}: { children: React.ReactNode; bg: string; fg: string; border?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "10px 22px",
        borderRadius: 999,
        background: bg,
        color: fg,
        border: border ? `2px solid ${border}` : undefined,
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

/* ============== SLIDE 1 — GANCHO ============== */
function Slide1({ data }: { data: CarrosselData }) {
  const text = data.gancho || "Sua pergunta provocadora aqui.";
  const isShort = text.length <= 38;
  const dataLabel = formatDataCurta(data.data);

  return (
    <>
      {/* Fundo coral + gradient sunrise no rodapé */}
      <div style={{ position: "absolute", inset: 0, background: C.coral }} />
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 110%, ${C.gold} 0%, ${C.coral} 35%, ${C.coralDeep} 70%, ${C.coralDark} 100%)`,
        }}
      />
      {/* Anéis solares decorativos */}
      <svg width="900" height="900" style={{ position: "absolute", top: -180, right: -200, opacity: 0.32 }}>
        {[120, 180, 240, 320, 410].map((r) => (
          <circle key={r} cx="450" cy="450" r={r} fill="none" stroke={C.gold} strokeWidth="3" />
        ))}
      </svg>

      {/* Selo topo */}
      <div style={{ position: "absolute", top: 56, left: 60 }}>
        <Pill bg={C.gold} fg={C.tealDeep}>
          Devocional{dataLabel ? ` · ${dataLabel}` : ""}
        </Pill>
      </div>

      {/* Texto-gancho */}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 60,
          right: 60,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: isShort ? 124 : 96,
          lineHeight: 1.02,
          color: C.cream,
          letterSpacing: "-0.02em",
          textShadow: "0 6px 24px rgba(0,0,0,0.18)",
        }}
      >
        {text}
      </div>

      {/* CTA inferior */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: C.cream,
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "0.04em",
        }}
      >
        Deslize <span style={{ fontSize: 28 }}>→</span>
      </div>
    </>
  );
}

/* ============== SLIDE 2 — CONTEXTO ============== */
function Slide2({ data }: { data: CarrosselData }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: C.sand }} />
      {/* Bloco coral diagonal à direita */}
      <svg width={SLIDE_SIZE} height={SLIDE_SIZE} style={{ position: "absolute", inset: 0 }}>
        <polygon
          points={`${SLIDE_SIZE},0 ${SLIDE_SIZE},${SLIDE_SIZE} ${SLIDE_SIZE * 0.55},${SLIDE_SIZE} ${SLIDE_SIZE * 0.72},0`}
          fill={C.coral}
        />
        <polygon
          points={`${SLIDE_SIZE},0 ${SLIDE_SIZE},${SLIDE_SIZE * 0.18} ${SLIDE_SIZE * 0.78},0`}
          fill={C.gold}
        />
      </svg>

      <div style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
        <Pill bg={C.tealDeep} fg={C.gold}>Onde você está</Pill>
        <div
          style={{
            marginTop: 44,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.18,
            color: C.tealDeep,
            maxWidth: "78%",
          }}
        >
          {data.contexto || "Descreva o cenário do leitor aqui."}
        </div>
      </div>
    </>
  );
}

/* ============== SLIDE 3 — VERSÍCULO ============== */
function Slide3({ data }: { data: CarrosselData }) {
  return (
    <>
      <div
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(160deg, ${C.teal} 0%, ${C.tealDeep} 60%, ${C.tealInk} 100%)`,
        }}
      />
      {/* Sol grande translúcido */}
      <div
        style={{
          position: "absolute", top: -200, left: -200, width: 700, height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.gold}33 0%, transparent 70%)`,
        }}
      />

      <div style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
        <Pill bg={C.gold} fg={C.tealDeep}>Palavra de hoje</Pill>
      </div>

      {/* Card central */}
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 80,
          right: 80,
          padding: "60px 56px 50px",
          background: "rgba(255,255,255,0.06)",
          border: `2px solid ${C.gold}`,
          borderRadius: 28,
          boxShadow: `0 0 0 1px ${C.gold}55 inset`,
        }}
      >
        <div style={{ fontFamily: fraunces, fontStyle: "italic", fontWeight: 400, fontSize: 80, color: C.gold, lineHeight: 0.6, height: 40 }}>
          “
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 42,
            lineHeight: 1.45,
            color: C.cream,
          }}
        >
          {data.versiculo || "O versículo aparece aqui."}
        </div>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "flex-end" }}>
          <Pill bg={C.gold} fg={C.tealDeep}>{data.referencia || "Livro 1:1"}</Pill>
        </div>
      </div>
    </>
  );
}

/* ============== SLIDE 4 — REFLEXÃO ============== */
function Slide4({ data }: { data: CarrosselData }) {
  const parts = parseHighlight(data.reflexao || "Sua reflexão com uma *palavra* destacada.");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: C.coralDeep }} />
      {/* Bloco areia diagonal inferior */}
      <svg width={SLIDE_SIZE} height={SLIDE_SIZE} style={{ position: "absolute", inset: 0 }}>
        <polygon
          points={`0,${SLIDE_SIZE} 0,${SLIDE_SIZE * 0.78} ${SLIDE_SIZE * 0.45},${SLIDE_SIZE} `}
          fill={C.sand}
        />
      </svg>
      {/* Aspas decorativas */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 40,
          fontFamily: fraunces,
          fontWeight: 900,
          fontSize: 380,
          lineHeight: 1,
          color: C.gold,
          opacity: 0.18,
        }}
      >
        “
      </div>

      <div style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
        <Pill bg={C.gold} fg={C.tealDeep}>Reflexão</Pill>
        <div
          style={{
            marginTop: 56,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 60,
            lineHeight: 1.22,
            color: C.cream,
          }}
        >
          {parts.map((p, i) =>
            p.h ? (
              <span
                key={i}
                style={{
                  color: C.gold,
                  borderBottom: `4px solid ${C.gold}`,
                  paddingBottom: 2,
                }}
              >
                {p.t}
              </span>
            ) : (
              <span key={i}>{p.t}</span>
            )
          )}
        </div>
      </div>
    </>
  );
}

/* ============== SLIDE 5 — PARA HOJE ============== */
function Slide5({ data }: { data: CarrosselData }) {
  const items = (data.aplicacao || "Ação 1\nAção 2\nAção 3")
    .split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3);

  const cardStyles = [
    { bg: C.coral, fg: C.cream, num: C.gold },
    { bg: C.tealDeep, fg: C.cream, num: C.gold },
    { bg: C.gold, fg: C.tealDeep, num: C.coralDeep },
  ];

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: C.sand }} />

      <div style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
        <Pill bg={C.coral} fg={C.cream}>Para hoje</Pill>
      </div>

      <div
        style={{
          position: "absolute",
          top: 310,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {items.map((it, i) => {
          const s = cardStyles[i] ?? cardStyles[0];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: "30px 40px",
                background: s.bg,
                color: s.fg,
                borderRadius: 24,
                boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
              }}
            >
              <div
                style={{
                  fontFamily: fraunces,
                  fontStyle: "italic",
                  fontWeight: 900,
                  fontSize: 80,
                  lineHeight: 1,
                  color: s.num,
                  minWidth: 90,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: 1.25,
                }}
              >
                {it}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ============== SLIDE 6 — PENSE NISSO ============== */
function Slide6({ data }: { data: CarrosselData }) {
  return (
    <>
      <div
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, ${C.coral} 0%, ${C.gold} 50%, ${C.teal} 100%)`,
        }}
      />
      <div style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
        <Pill bg={C.tealDeep} fg={C.gold}>Pense nisso</Pill>
        <div
          style={{
            marginTop: 60,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 76,
            lineHeight: 1.1,
            color: C.cream,
            textShadow: "0 4px 18px rgba(0,0,0,0.20)",
          }}
        >
          {data.pergunta || "Sua pergunta de fechamento aqui."}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 130,
          left: 60,
          right: 60,
          display: "flex",
          gap: 14,
        }}
      >
        <Pill bg={C.cream} fg={C.tealDeep}>🔖 Salve</Pill>
        <Pill bg={C.cream} fg={C.tealDeep}>💬 Comente</Pill>
        <Pill bg={C.cream} fg={C.tealDeep}>↗ Compartilhe</Pill>
      </div>
    </>
  );
}

/* ============== SLIDE 7 — CTA ============== */
function Slide7() {
  return (
    <>
      <div
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.tealInk} 100%)`,
        }}
      />
      {/* Sol grande */}
      <svg width="700" height="700" style={{ position: "absolute", bottom: -200, right: -150, opacity: 0.55 }}>
        {[120, 180, 250, 330].map((r) => (
          <circle key={r} cx="350" cy="350" r={r} fill="none" stroke={C.gold} strokeWidth="3" />
        ))}
        <circle cx="350" cy="350" r="80" fill={C.gold} />
      </svg>

      <div style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
        <Pill bg={C.coral} fg={C.cream}>O texto completo te espera</Pill>
        <div
          style={{
            marginTop: 50,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 80,
            lineHeight: 1.05,
            color: C.cream,
            maxWidth: "85%",
          }}
        >
          Leia o devocional <span style={{ color: C.gold }}>completo</span>.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            padding: "22px 36px",
            background: C.coral,
            color: C.cream,
            borderRadius: 999,
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: "0.02em",
            boxShadow: "0 16px 40px rgba(213,72,46,0.55)",
          }}
        >
          fontedealegria.com.br
        </div>
        <div style={{ color: C.goldSoft, fontFamily: inter, fontWeight: 700, fontSize: 26 }}>
          @fontedealegriadiaria
        </div>
        <div style={{ color: C.cream, fontFamily: inter, fontSize: 20, opacity: 0.85, marginTop: 4 }}>
          Toque no link da bio →
        </div>
      </div>
    </>
  );
}