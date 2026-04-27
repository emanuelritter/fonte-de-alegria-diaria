import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Devocional from "./pages/Devocional.tsx";
import PlanoLeitura from "./pages/PlanoLeitura.tsx";
import Historias from "./pages/Historias.tsx";
import Compartilhar from "./pages/Compartilhar.tsx";
import Oracao from "./pages/Oracao.tsx";
import Conecte from "./pages/Conecte.tsx";
import Sobre from "./pages/Sobre.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/devocional" element={<Devocional />} />
          <Route path="/devocional/:data" element={<Devocional />} />
          <Route path="/plano-de-leitura" element={<PlanoLeitura />} />
          <Route path="/historias" element={<Historias />} />
          <Route path="/compartilhar" element={<Compartilhar />} />
          <Route path="/oracao" element={<Oracao />} />
          <Route path="/conecte-se" element={<Conecte />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
