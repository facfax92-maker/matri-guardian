import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle2, Stethoscope, FileText,
  Send, MessageSquare, Activity, AlertTriangle, User,
  Building2, Ambulance, ClipboardList, LogOut, Moon, Sun
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface Referral {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string;
  facility: string;
  urgency: string;
  provisional_diagnosis: string;
  additional_notes: string;
  transport_arranged: boolean;
  sms_preview: string;
  status: string;
  tracking_status: string;
  referred_by: string | null;
  assigned_doctor: string | null;
  created_at: string;
}

interface ReferralUpdate {
  id: string;
  referral_id: string;
  status: string;
  message: string;
  created_by: string | null;
  created_at: string;
}

interface DischargeSummary {
  id: string;
  referral_id: string;
  patient_id: string;
  diagnosis: string;
  treatment_given: string;
  medications: string;
  follow_up_instructions: string;
  outcome: string;
  discharged_at: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-warning-foreground', bg: 'bg-warning-bg' },
  'patient-arrived': { label: 'Patient Arrived', icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
  'treatment-started': { label: 'Treatment Started', icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10' },
  discharged: { label: 'Discharged', icon: CheckCircle2, color: 'text-success-foreground', bg: 'bg-success-bg' },
};

const HospitalPortal = () => {
  const { profile, signOut } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [updates, setUpdates] = useState<Record<string, ReferralUpdate[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [dischargeForm, setDischargeForm] = useState({
    diagnosis: '',
    treatment_given: '',
    medications: '',
    follow_up_instructions: '',
    outcome: 'improved',
  });
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');

  const fetchReferrals = async () => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReferrals(data);
      // Fetch updates for all referrals
      const { data: allUpdates } = await supabase
        .from('referral_updates')
        .select('*')
        .order('created_at', { ascending: true });

      if (allUpdates) {
        const grouped: Record<string, ReferralUpdate[]> = {};
        allUpdates.forEach((u: ReferralUpdate) => {
          if (!grouped[u.referral_id]) grouped[u.referral_id] = [];
          grouped[u.referral_id].push(u);
        });
        setUpdates(grouped);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReferrals();

    // Subscribe to realtime referral updates
    const channel = supabase
      .channel('hospital-portal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referral_updates' }, () => {
        fetchReferrals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedReferral || !newStatus) return;

    const { error: updateError } = await supabase
      .from('referral_updates')
      .insert({
        referral_id: selectedReferral.id,
        status: newStatus,
        message: statusMessage || `Status updated to ${statusConfig[newStatus]?.label || newStatus}`,
        created_by: profile?.id,
      });

    if (!updateError) {
      await supabase
        .from('referrals')
        .update({ tracking_status: newStatus })
        .eq('id', selectedReferral.id);

      toast({ title: 'Status Updated', description: `Referral status changed to ${statusConfig[newStatus]?.label}` });
      setStatusDialogOpen(false);
      setNewStatus('');
      setStatusMessage('');
      fetchReferrals();
    } else {
      toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
    }
  };

  const handleDischarge = async () => {
    if (!selectedReferral) return;

    const { error } = await supabase
      .from('discharge_summaries')
      .insert({
        referral_id: selectedReferral.id,
        patient_id: selectedReferral.patient_id,
        ...dischargeForm,
        created_by: profile?.id,
      });

    if (!error) {
      // Also update referral status to discharged
      await supabase.from('referral_updates').insert({
        referral_id: selectedReferral.id,
        status: 'discharged',
        message: `Patient discharged. Outcome: ${dischargeForm.outcome}. Follow-up: ${dischargeForm.follow_up_instructions || 'None specified'}`,
        created_by: profile?.id,
      });
      await supabase.from('referrals').update({ tracking_status: 'discharged' }).eq('id', selectedReferral.id);

      toast({ title: 'Discharge Summary Saved', description: 'Patient has been discharged and FCHV will be notified.' });
      setDischargeDialogOpen(false);
      setDischargeForm({ diagnosis: '', treatment_given: '', medications: '', follow_up_instructions: '', outcome: 'improved' });
      fetchReferrals();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedReferral || !feedbackMessage) return;

    const { error } = await supabase
      .from('fchv_feedback')
      .insert({
        referral_id: selectedReferral.id,
        from_doctor: profile?.id,
        to_fchv: selectedReferral.referred_by,
        message: feedbackMessage,
        feedback_type: feedbackType,
      });

    if (!error) {
      toast({ title: 'Feedback Sent', description: 'Your feedback has been sent to the FCHV.' });
      setFeedbackDialogOpen(false);
      setFeedbackMessage('');
      setFeedbackType('general');
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const activeReferrals = referrals.filter(r => r.tracking_status !== 'discharged');
  const dischargedReferrals = referrals.filter(r => r.tracking_status === 'discharged');
  const urgentReferrals = referrals.filter(r => r.urgency === 'URGENT' && r.tracking_status !== 'discharged');

  const getNextStatuses = (current: string): string[] => {
    const flow = ['pending', 'patient-arrived', 'treatment-started', 'discharged'];
    const idx = flow.indexOf(current);
    return idx >= 0 ? flow.slice(idx + 1) : flow;
  };

  const ReferralCard = ({ referral }: { referral: Referral }) => {
    const config = statusConfig[referral.tracking_status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const refUpdates = updates[referral.id] || [];
    const hoursAgo = Math.round((Date.now() - new Date(referral.created_at).getTime()) / 3600000);

    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="card-gradient border-0 shadow-sm overflow-hidden">
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{referral.patient_name || referral.patient_id}</span>
              </div>
              <div className="flex items-center gap-2">
                {referral.urgency === 'URGENT' && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />URGENT
                  </Badge>
                )}
                <Badge className={`${config.bg} ${config.color} border-0 text-xs`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{referral.facility || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{hoursAgo}h ago</span>
              </div>
            </div>

            {referral.provisional_diagnosis && (
              <p className="text-xs bg-muted/50 rounded-lg p-2">
                <span className="font-medium">Dx:</span> {referral.provisional_diagnosis}
              </p>
            )}

            {/* Timeline preview */}
            {refUpdates.length > 0 && (
              <div className="border-t pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Latest update:</p>
                <p className="text-xs">{refUpdates[refUpdates.length - 1].message}</p>
              </div>
            )}

            {/* Actions */}
            {referral.tracking_status !== 'discharged' && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs gradient-primary text-primary-foreground border-0"
                  onClick={() => { setSelectedReferral(referral); setStatusDialogOpen(true); }}
                >
                  <ClipboardList className="h-3 w-3 mr-1" />
                  Update Status
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 h-8 text-xs"
                  onClick={() => { setSelectedReferral(referral); setDischargeDialogOpen(true); }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Discharge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => { setSelectedReferral(referral); setFeedbackDialogOpen(true); }}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary px-4 py-6 text-primary-foreground" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        <div className="container max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Stethoscope className="h-6 w-6" />
              <h1 className="text-xl font-bold tracking-tight">Hospital Portal</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={signOut} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-sm opacity-90 ml-12">Dr. {profile?.full_name || 'Doctor'}</p>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active', value: activeReferrals.length, icon: Activity, gradient: 'card-gradient-primary' },
            { label: 'Urgent', value: urgentReferrals.length, icon: AlertTriangle, gradient: 'card-gradient-danger' },
            { label: 'Discharged', value: dischargedReferrals.length, icon: CheckCircle2, gradient: 'card-gradient-success' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`text-center ${stat.gradient} border-0 shadow-sm`}>
                <CardContent className="p-4">
                  <stat.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Referral Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeReferrals.length})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent ({urgentReferrals.length})</TabsTrigger>
            <TabsTrigger value="discharged">Discharged ({dischargedReferrals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading referrals...</p>
            ) : activeReferrals.length === 0 ? (
              <Card className="card-gradient border-0">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active referrals</p>
                </CardContent>
              </Card>
            ) : (
              activeReferrals.map(r => <ReferralCard key={r.id} referral={r} />)
            )}
          </TabsContent>

          <TabsContent value="urgent" className="space-y-3 mt-4">
            {urgentReferrals.length === 0 ? (
              <Card className="card-gradient border-0">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No urgent referrals</p>
                </CardContent>
              </Card>
            ) : (
              urgentReferrals.map(r => <ReferralCard key={r.id} referral={r} />)
            )}
          </TabsContent>

          <TabsContent value="discharged" className="space-y-3 mt-4">
            {dischargedReferrals.length === 0 ? (
              <Card className="card-gradient border-0">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No discharged referrals yet</p>
                </CardContent>
              </Card>
            ) : (
              dischargedReferrals.map(r => <ReferralCard key={r.id} referral={r} />)
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Referral Status</DialogTitle>
            <DialogDescription>
              Patient: {selectedReferral?.patient_name || selectedReferral?.patient_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedReferral && getNextStatuses(selectedReferral.tracking_status).map(s => (
                    <SelectItem key={s} value={s}>
                      {statusConfig[s]?.label || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea
                placeholder="Add a note about this status update..."
                value={statusMessage}
                onChange={e => setStatusMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={handleUpdateStatus} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Discharge Summary</DialogTitle>
            <DialogDescription>
              Complete the discharge summary for {selectedReferral?.patient_name || selectedReferral?.patient_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Final Diagnosis *</Label>
              <Textarea
                placeholder="Enter final diagnosis..."
                value={dischargeForm.diagnosis}
                onChange={e => setDischargeForm(f => ({ ...f, diagnosis: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Treatment Given *</Label>
              <Textarea
                placeholder="Describe treatment provided..."
                value={dischargeForm.treatment_given}
                onChange={e => setDischargeForm(f => ({ ...f, treatment_given: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Medications Prescribed</Label>
              <Textarea
                placeholder="List medications and dosages..."
                value={dischargeForm.medications}
                onChange={e => setDischargeForm(f => ({ ...f, medications: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Follow-up Instructions</Label>
              <Textarea
                placeholder="Instructions for FCHV follow-up care..."
                value={dischargeForm.follow_up_instructions}
                onChange={e => setDischargeForm(f => ({ ...f, follow_up_instructions: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={dischargeForm.outcome} onValueChange={v => setDischargeForm(f => ({ ...f, outcome: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improved">Improved</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="referred-higher">Referred to Higher Center</SelectItem>
                  <SelectItem value="complicated">Complicated - Needs Close Follow-up</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDischargeDialogOpen(false)}>Cancel</Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              onClick={handleDischarge}
              disabled={!dischargeForm.diagnosis || !dischargeForm.treatment_given}
            >
              Save & Discharge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback to FCHV</DialogTitle>
            <DialogDescription>
              Send a message to the FCHV who referred {selectedReferral?.patient_name || 'this patient'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Update</SelectItem>
                  <SelectItem value="praise">Good Referral - Praise</SelectItem>
                  <SelectItem value="guidance">Clinical Guidance</SelectItem>
                  <SelectItem value="follow-up-needed">Follow-up Required</SelectItem>
                  <SelectItem value="urgent">Urgent Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                placeholder="Write your feedback message..."
                value={feedbackMessage}
                onChange={e => setFeedbackMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              onClick={handleSendFeedback}
              disabled={!feedbackMessage}
            >
              <Send className="h-4 w-4 mr-1" />
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalPortal;
