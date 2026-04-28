import { Link } from "react-router-dom";
import { Sun, Instagram, Youtube, Heart } from "lucide-react";

export const Footer = () => (
  <footer className="bg-gradient-deep text-primary-foreground mt-24">
    <div className="container py-16 grid gap-10 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-coral shadow-warm">
            <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-serif italic text-2xl text-white">
            fonte de <span className="font-bold">alegria</span>
          </span>
        </div>
        <p className="text-white/75 max-w-md leading-relaxed">
          Devocionais diários para nutrir sua fé, compartilhar histórias e caminhar em comunhão com Deus.
        </p>
        <div className="flex gap-3 mt-6">
          <a
            href="https://www.instagram.com/fontedealegriadiaria/"
            target="_blank"
            rel="noreferrer"
            className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-coral transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://www.youtube.com/@fontedealegriadiaria"
            target="_blank"
            rel="noreferrer"
            className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-coral transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div>
        <h4 className="font-serif text-lg mb-4 text-white">Explorar</h4>
        <ul className="space-y-2 text-white/75 text-sm">
          <li><Link to="/devocional" className="hover:text-coral transition-colors">Devocional do dia</Link></li>
          <li><Link to="/plano-de-leitura" className="hover:text-coral transition-colors">Plano de leitura</Link></li>
          <li><Link to="/historias" className="hover:text-coral transition-colors">Histórias de fé</Link></li>
          <li><Link to="/oracao" className="hover:text-coral transition-colors">Oração</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-serif text-lg mb-4 text-white">Conecte-se</h4>
        <ul className="space-y-2 text-white/75 text-sm">
          <li><Link to="/conecte-se" className="hover:text-coral transition-colors">Igreja em Indaiatuba</Link></li>
          <li><a href="https://www.novotempo.com" target="_blank" rel="noreferrer" className="hover:text-coral transition-colors">Rede Novo Tempo</a></li>
          <li><Link to="/sobre" className="hover:text-coral transition-colors">Sobre o projeto</Link></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <p>
          © 2025 Fonte de Alegria. Feito com propósito para a glória de Deus.
        </p>
        <p className="flex items-center gap-1">
          Feito com <Heart className="h-3 w-3 fill-coral text-coral" /> para a glória de Deus.
        </p>
      </div>
    </div>
  </footer>
);