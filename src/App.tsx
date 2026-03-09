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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/new" element={<PatientRegistration />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/patients/:id/visits/new" element={<NewVisitForm />} />
                <Route path="/patients/:id/visits/:visitId" element={<VisitDetail />} />
                <Route path="/patients/:id/referral" element={<ReferralForm />} />
                <Route path="/patients/:id/referral-success" element={<ReferralSuccess />} />
                <Route path="/patients/:id/postpartum" element={<PostpartumForm />} />
                <Route path="/hospital-portal" element={<HospitalPortal />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/switch-account" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
