import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import StreamPage from "./pages/StreamPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import LibraryPage from "./pages/LibraryPage";
import RENKIVADashboard from "./components/RENKIVADashboard";
import MeshLibraryExplorer from "./components/MeshLibraryExplorer";
import RENKIVAApp from "./components/RENKIVAApp";
import MeshNetworkDashboard from "./components/MeshNetworkDashboard";
import { MassImportDashboard } from "./components/MassImportDashboard";
import { StorageDashboard } from "./components/StorageDashboard";
import { PitchDeck } from "./components/PitchDeck";
import { CreatorOnboarding } from "./components/CreatorOnboarding";
import { SponsorOnboarding } from "./components/SponsorOnboarding";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Settings from "./pages/Settings";
import { AuthProvider } from "./hooks/useAuth";
import { LocationConsentModal } from "./components/LocationConsentModal";
import { useLocationConsent } from "./hooks/useLocationConsent";
import { LanguageDetectionToast } from "./components/LanguageDetectionToast";
import { isRTL } from "./i18n";
import i18n from "./i18n";

const queryClient = new QueryClient();

// Apply initial RTL direction based on stored/detected language
if (typeof window !== 'undefined') {
  document.documentElement.dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
  document.documentElement.lang = i18n.language;
}

function AppContent() {
  const { shouldShowConsentModal, grantConsent, revokeConsent } = useLocationConsent();

  return (
    <>
      <Toaster />
      <Sonner />
      <LanguageDetectionToast />
      <LocationConsentModal
        open={shouldShowConsentModal}
        onConsent={grantConsent}
        onDecline={revokeConsent}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<RENKIVADashboard />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:genre" element={<LibraryPage />} />
          <Route path="/mesh-library" element={<MeshLibraryExplorer />} />
          <Route path="/renkiva" element={<RENKIVAApp />} />
          <Route path="/mesh-network" element={<MeshNetworkDashboard />} />
          <Route path="/mass-import" element={<MassImportDashboard />} />
          <Route path="/storage" element={<StorageDashboard />} />
          <Route path="/pitch" element={<PitchDeck />} />
          <Route path="/creator" element={<CreatorOnboarding />} />
          <Route path="/sponsor" element={<SponsorOnboarding />} />
          <Route path="/stream/:id" element={<StreamPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/legal/terms-of-use" element={<TermsOfUse />} />
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
