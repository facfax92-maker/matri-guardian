import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { SplashScreen } from "@/components/SplashScreen";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientRegistration from "./pages/PatientRegistration";
import PatientDetail from "./pages/PatientDetail";
import NewVisitForm from "./pages/NewVisitForm";
import VisitDetail from "./pages/VisitDetail";
import ReferralForm from "./pages/ReferralForm";
import ReferralSuccess from "./pages/ReferralSuccess";
import PostpartumForm from "./pages/PostpartumForm";
import HospitalPortal from "./pages/HospitalPortal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SettingsPage from "./pages/SettingsPage";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/patients" element={<PageTransition><PatientList /></PageTransition>} />
        <Route path="/patients/new" element={<PageTransition><PatientRegistration /></PageTransition>} />
        <Route path="/patients/:id" element={<PageTransition><PatientDetail /></PageTransition>} />
        <Route path="/patients/:id/visits/new" element={<PageTransition><NewVisitForm /></PageTransition>} />
        <Route path="/patients/:id/visits/:visitId" element={<PageTransition><VisitDetail /></PageTransition>} />
        <Route path="/patients/:id/referral" element={<PageTransition><ReferralForm /></PageTransition>} />
        <Route path="/patients/:id/referral-success" element={<PageTransition><ReferralSuccess /></PageTransition>} />
        <Route path="/patients/:id/postpartum" element={<PageTransition><PostpartumForm /></PageTransition>} />
        <Route path="/hospital-portal" element={<PageTransition><HospitalPortal /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        <Route path="/edit-profile" element={<PageTransition><EditProfile /></PageTransition>} />
        <Route path="/switch-account" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AnimatedRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
