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
import MeshLibraryExplorer from "./components/MeshLibraryExplorer";
import MeshTVApp from "./components/MeshTVApp";
import MeshNetworkDashboard from "./components/MeshNetworkDashboard";
import { MassImportDashboard } from "./components/MassImportDashboard";
import { StorageDashboard } from "./components/StorageDashboard";
import { PitchDeck } from "./components/PitchDeck";
import { CreatorOnboarding } from "./components/CreatorOnboarding";
import { SponsorOnboarding } from "./components/SponsorOnboarding";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
          <Route path="/mesh-library" element={<MeshLibraryExplorer />} />
          <Route path="/meshtv" element={<MeshTVApp />} />
        <Route path="/mesh-network" element={<MeshNetworkDashboard />} />
        <Route path="/mass-import" element={<MassImportDashboard />} />
        <Route path="/storage" element={<StorageDashboard />} />
          <Route path="/pitch" element={<PitchDeck />} />
        <Route path="/creator" element={<CreatorOnboarding />} />
        <Route path="/sponsor" element={<SponsorOnboarding />} />
        <Route path="/library" element={<LibraryPage />} />
          <Route path="/stream/:id" element={<StreamPage />} />
          <Route path="/legal/terms-of-use" element={<TermsOfUse />} />
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
