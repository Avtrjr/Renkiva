import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LightTheme from "./pages/LightTheme";
import StreamPage from "./pages/StreamPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import LibraryPage from "./pages/LibraryPage";
import MeshTVDashboard from "./components/MeshTVDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/light" element={<LightTheme />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<MeshTVDashboard />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:genre" element={<LibraryPage />} />
          <Route path="/stream/:id" element={<StreamPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
