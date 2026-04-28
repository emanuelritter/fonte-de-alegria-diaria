import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CarrosselData, TOTAL_SLIDES } from "@/lib/carrosselSlides";
import { SLIDE_SIZE, SlideCanvas } from "./SlideCanvas";

interface Props {
  data: CarrosselData;
  current: number;
  setCurrent: (n: number) => void;
  onExport: () => Promise<void>;
  exporting: { active: boolean; current: number; total: number };
}

export function SlidePreview({ data, current, setCurrent, onExport, exporting }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // Fit-scale the 1080 canvas inside the available width.
  useEffect(() => {
    const compute = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth;
      // Cap canvas display height to viewport so it never overflows.
      const maxH = Math.max(320, window.innerHeight - 360);
      const s = Math.min((w - 32) / SLIDE_SIZE, maxH / SLIDE_SIZE, 0.7);
      setScale(Math.max(0.18, s));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div
      className="flex flex-col items-center gap-5 p-6 lg:p-8 min-h-full"
      style={{ background: "#1A1B19" }}
    >
      <div ref={wrapRef} className="w-full flex justify-center">
        <div
          style={{
            width: SLIDE_SIZE * scale,
            height: SLIDE_SIZE * scale,
          }}
          className="relative shadow-2xl"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: SLIDE_SIZE,
              height: SLIDE_SIZE,
            }}
          >
            <SlideCanvas data={data} index={current} />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-3">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setCurrent(n)}
            aria-label={`Ir para slide ${n}`}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              n === current ? "scale-125" : "hover:scale-110"
            )}
            style={{
              background: n === current ? "#C8963A" : "#2A2520",
            }}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrent(Math.max(1, current - 1))}
          disabled={current === 1}
          className="text-[#9A9490] hover:text-[#F0EDE8] hover:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <span style={{ color: "#6B6560", fontFamily: "ui-monospace, monospace", fontSize: 13 }}>
          {String(current).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrent(Math.min(TOTAL_SLIDES, current + 1))}
          disabled={current === TOTAL_SLIDES}
          className="text-[#9A9490] hover:text-[#F0EDE8] hover:bg-white/5"
        >
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Export */}
      <Button
        onClick={onExport}
        disabled={exporting.active}
        size="lg"
        className="rounded-full px-8"
        style={{
          background: "#C8963A",
          color: "#0E0F0D",
        }}
      >
        {exporting.active ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exportando {exporting.current} de {exporting.total}...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Baixar slides
          </>
        )}
      </Button>
    </div>
  );
}