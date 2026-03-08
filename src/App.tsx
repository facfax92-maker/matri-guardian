import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientRegistration from "./pages/PatientRegistration";
import PatientDetail from "./pages/PatientDetail";
import NewVisitForm from "./pages/NewVisitForm";
import VisitDetail from "./pages/VisitDetail";
import ReferralForm from "./pages/ReferralForm";
import ReferralSuccess from "./pages/ReferralSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientRegistration />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/patients/:id/visits/new" element={<NewVisitForm />} />
          <Route path="/patients/:id/visits/:visitId" element={<VisitDetail />} />
          <Route path="/patients/:id/referral" element={<ReferralForm />} />
          <Route path="/patients/:id/referral-success" element={<ReferralSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
