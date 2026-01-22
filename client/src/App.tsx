// Contract Negotiation Tracker - App.tsx
// Design: Refined Legal Elegance - Light theme with deep navy and gold accents

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NegotiationProvider } from "./contexts/NegotiationContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { WelcomeModal } from "./components/onboarding/WelcomeModal";
import { TourTooltip } from "./components/onboarding/TourTooltip";
import { HelpWidget } from "./components/onboarding/HelpWidget";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <NegotiationProvider>
          <OnboardingProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              {/* Onboarding Components */}
              <WelcomeModal />
              <TourTooltip />
              <HelpWidget />
            </TooltipProvider>
          </OnboardingProvider>
        </NegotiationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
