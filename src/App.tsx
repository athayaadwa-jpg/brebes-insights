import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import Beranda from "./pages/Beranda";
import Ringkasan from "./pages/Ringkasan";
import Indikator from "./pages/Indikator";
import Konsep from "./pages/Konsep";
import Panduan from "./pages/Panduan";
import Hubungi from "./pages/Hubungi";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Beranda />} />
            <Route path="/ringkasan" element={<Ringkasan />} />
            <Route path="/indikator/:slug" element={<Indikator />} />
            <Route path="/konsep" element={<Konsep />} />
            <Route path="/panduan" element={<Panduan />} />
            <Route path="/hubungi" element={<Hubungi />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
