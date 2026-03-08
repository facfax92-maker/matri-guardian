import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes - all authenticated users */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
            <Route path="/patients/:id/visits/:visitId" element={<ProtectedRoute><VisitDetail /></ProtectedRoute>} />

            {/* FCHV + Supervisor + Doctor + Admin */}
            <Route path="/patients/new" element={
              <ProtectedRoute allowedRoles={['fchv', 'supervisor', 'admin']}>
                <PatientRegistration />
              </ProtectedRoute>
            } />
            <Route path="/patients/:id/visits/new" element={
              <ProtectedRoute allowedRoles={['fchv', 'supervisor', 'admin']}>
                <NewVisitForm />
              </ProtectedRoute>
            } />
            <Route path="/patients/:id/referral" element={
              <ProtectedRoute allowedRoles={['fchv', 'supervisor', 'doctor', 'admin']}>
                <ReferralForm />
              </ProtectedRoute>
            } />
            <Route path="/patients/:id/referral-success" element={
              <ProtectedRoute allowedRoles={['fchv', 'supervisor', 'doctor', 'admin']}>
                <ReferralSuccess />
              </ProtectedRoute>
            } />
            <Route path="/patients/:id/postpartum" element={
              <ProtectedRoute allowedRoles={['fchv', 'supervisor', 'doctor', 'admin']}>
                <PostpartumForm />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
