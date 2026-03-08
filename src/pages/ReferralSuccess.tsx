import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, User, Home } from 'lucide-react';
import { Referral } from '@/lib/types';
import { motion } from 'framer-motion';

const ReferralSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const referral = (location.state as { referral?: Referral })?.referral;

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Success Icon */}
        <motion.div
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-bg mb-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Referral Generated Successfully</h1>
          <p className="text-muted-foreground mt-2">{new Date().toLocaleString()}</p>
        </motion.div>

        {/* Referral Summary */}
        {referral && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Referral Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Facility</span><span className="font-medium">{referral.facility}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Urgency</span><span className="font-semibold text-danger">{referral.urgency}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Diagnosis</span><span className="font-medium">{referral.provisionalDiagnosis}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transport</span><span className="font-medium">{referral.transportArranged ? 'Arranged' : 'Not arranged'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SMS Status</span><span className="font-medium text-success">Sent (simulated)</span></div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Next Steps</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {[
                'Help arrange transport (within 2 hours)',
                'Follow up within 24 hours to confirm arrival',
                'Record outcome in system when available',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pb-6">
          <Button variant="outline" className="h-12">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="secondary" className="h-12" onClick={() => navigate(`/patients/${id}`)}>
            <User className="h-4 w-4 mr-2" />
            View Patient Record
          </Button>
          <Button className="gradient-primary text-primary-foreground border-0 h-12" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ReferralSuccess;
