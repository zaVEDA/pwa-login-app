
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import Investor from "./pages/Investor";
import Welcome from "./pages/Welcome";
import Legal from "./pages/Legal";
import Offer from "./pages/Offer";
import Privacy from "./pages/Privacy";
import OfferPromo from "./pages/OfferPromo";
import SmsOperators from "./pages/SmsOperators";
import Templates from "./pages/Templates";
import SharedDoc from "./pages/SharedDoc";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import NotFound from "./pages/NotFound";
import DevSwitcher from "./components/app/DevSwitcher";
import MetrikaTracker from "./components/MetrikaTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MetrikaTracker />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/app" element={<Index />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* Страница для инвесторов отключена от публичного доступа. Чтобы вернуть — раскомментировать. */}
          {/* <Route path="/investor" element={<Investor />} /> */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/offer-promo" element={<OfferPromo />} />
          <Route path="/sms-operators" element={<SmsOperators />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/doc/:token" element={<SharedDoc />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          <Route path="/legal-flow" element={<Navigate to="/legal" replace />} />
          {/* Личная ссылка Заведующей — вход в кабинет */}
          <Route path="/zaved" element={<Navigate to="/app?enter=1&admin=1" replace />} />
          {/* Личная ссылка для просмотра демо-режима (гость) — доступна только по прямому URL */}
          <Route path="/guest" element={<Navigate to="/app?enter=1&demo=1" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DevSwitcher />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;