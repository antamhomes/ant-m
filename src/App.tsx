import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* LanguageProvider reads/writes the language from the URL, so it lives inside the router. */}
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vn" element={<Index />} />
            {/* Convenience aliases → canonical language URLs */}
            <Route path="/cz" element={<Navigate to="/" replace />} />
            <Route path="/cs" element={<Navigate to="/" replace />} />
            <Route path="/vi" element={<Navigate to="/vn" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
