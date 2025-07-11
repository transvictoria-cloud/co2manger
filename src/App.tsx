
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Cylinders from "./pages/Cylinders";
import Tank from "./pages/Tank";
import Filling from "./pages/Filling";
import Transfers from "./pages/Transfers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cylinders" element={<Cylinders />} />
              <Route path="/tank" element={<Tank />} />
              <Route path="/filling" element={<Filling />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/maintenance" element={<div className="p-6"><h1 className="text-2xl font-bold">Mantenimiento - Próximamente</h1></div>} />
              <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reportes - Próximamente</h1></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
