import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, saveReferral, initStorage } from '@/lib/storage';
import { Patient, Referral, Urgency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';
import { useToast } from '@/hooks/use-toast';

const ReferralForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);

  const [facility, setFacility] = useState('District Hospital Maternity Ward');
  const [diagnosis, setDiagnosis] = useState('Severe Preeclampsia');
  const [notes, setNotes] = useState('');
  const [transportArranged, setTransportArranged] = useState(false);

  useEffect(() => {
    initStorage();
    if (id) setPatient(getPatient(id) || null);
  }, [id]);

  if (!patient) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Patient not found</div>;

  const lastVisit = patient.visits[patient.visits.length - 1];
  const urgency: Urgency = lastVisit?.riskLevel === 'HIGH' ? 'URGENT' : 'ROUTINE';

  const smsPreview = `URGENT MATERNAL REFERRAL
Patient: ${patient.name}, ${patient.age}y, G${patient.gravida}P${patient.para}
GA: ${patient.gestationalAge} weeks
Condition: ${diagnosis}
BP: ${lastVisit?.systolic}/${lastVisit?.diastolic}
Symptoms: ${[
    lastVisit?.proteinuria !== 'Negative' && `Proteinuria ${lastVisit?.proteinuria}`,
    lastVisit?.edema !== 'None' && `Edema`,
    lastVisit?.headache !== 'None' && `Headache`,
    lastVisit?.visualDisturbances && 'Visual disturbances',
  ].filter(Boolean).join(', ')}
ETA: ~2 hours
FCHV: ${patient.fchvAssigned}
Contact: ${patient.phone}

MatriCare Alert System`;

  const handleSubmit = (status: 'sent' | 'draft') => {
    const referral: Referral = {
      id: `r${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString(),
      facility,
      urgency,
      provisionalDiagnosis: diagnosis,
      additionalNotes: notes,
      transportArranged,
      smsPreview,
      status,
    };
    saveReferral(referral);
    if (status === 'sent') {
      navigate(`/patients/${patient.id}/referral-success`, { state: { referral } });
    } else {
      toast({ title: 'Referral saved as draft' });
      navigate(`/patients/${patient.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-danger px-4 py-4 text-primary-foreground">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Generate Referral</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Auto-filled Patient Info */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Patient Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{patient.name}, {patient.age}y</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">G/P</span><span className="font-medium">G{patient.gravida}P{patient.para}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GA</span><span className="font-medium">{patient.gestationalAge} weeks</span></div>
            {lastVisit && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">BP</span><span className="font-medium">{lastVisit.systolic}/{lastVisit.diastolic} mmHg</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Risk</span>
                  <RiskBadge level={lastVisit.riskLevel} score={lastVisit.riskScore} size="sm" />
                </div>
              </>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Visits</span><span className="font-medium">{patient.visits.length} completed</span></div>
          </CardContent>
        </Card>

        {/* Referral Form */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Referral Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Referral Facility</Label>
              <Select value={facility} onValueChange={setFacility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="District Hospital Maternity Ward">District Hospital Maternity Ward</SelectItem>
                  <SelectItem value="Primary Health Center Level 3">Primary Health Center Level 3</SelectItem>
                  <SelectItem value="Health Post">Health Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urgency</Label>
              <div className="mt-1">
                <RiskBadge level={urgency === 'URGENT' ? 'HIGH' : 'LOW'} size="md" className={urgency === 'URGENT' ? '' : ''} />
              </div>
            </div>

            <div>
              <Label>Provisional Diagnosis</Label>
              <Select value={diagnosis} onValueChange={setDiagnosis}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Severe Preeclampsia">Severe Preeclampsia</SelectItem>
                  <SelectItem value="Gestational Hypertension">Gestational Hypertension</SelectItem>
                  <SelectItem value="Gestational Diabetes">Gestational Diabetes</SelectItem>
                  <SelectItem value="Anemia">Anemia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional observations..." rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={transportArranged} onCheckedChange={(c) => setTransportArranged(!!c)} id="transport" />
              <Label htmlFor="transport" className="font-normal">Transport arranged</Label>
            </div>
          </CardContent>
        </Card>

        {/* SMS Preview */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">SMS Preview</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded-lg text-xs whitespace-pre-wrap font-mono">{smsPreview}</pre>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pb-6">
          <Button className="gradient-danger text-primary-foreground border-0 h-12" onClick={() => handleSubmit('sent')}>
            <Send className="h-4 w-4 mr-2" />
            Generate Referral & Send SMS
          </Button>
          <Button variant="secondary" onClick={() => handleSubmit('draft')}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </main>
    </div>
  );
};

export default ReferralForm;
