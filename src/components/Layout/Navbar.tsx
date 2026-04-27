import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/devocional", label: "Devocional" },
  { to: "/plano-de-leitura", label: "Plano de Leitura" },
  { to: "/historias", label: "Histórias" },
  { to: "/oracao", label: "Oração" },
  { to: "/conecte-se", label: "Conecte-se" },
  { to: "/sobre", label: "Sobre" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-warm shadow-warm">
            <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-serif italic text-xl md:text-2xl leading-none">
            <span className="text-foreground">fonte de</span>{" "}
            <span className="text-gradient-warm font-bold">alegria</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-full transition-colors",
                  isActive
                    ? "text-primary bg-secondary"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary/60"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-full hover:bg-secondary"
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md animate-fade-in-up">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    isActive
                      ? "text-primary bg-secondary"
                      : "text-foreground/80 hover:bg-secondary"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};