
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import Investor from "./pages/Investor";
import Welcome from "./pages/Welcome";
import Legal from "./pages/Legal";
import LegalFlow from "./pages/LegalFlow";
import Agreements from "./pages/Agreements";
import NotFound from "./pages/NotFound";
import DevSwitcher from "./components/app/DevSwitcher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/app" element={<Index />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/investor" element={<Investor />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/legal-flow" element={<LegalFlow />} />
          <Route path="/agreements" element={<Agreements />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DevSwitcher />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;