import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, savePatient, addAlert } from '@/lib/storage';
import { Patient, Visit, Proteinuria, EdemaLevel, HeadacheLevel, FetalMovement, VisitType } from '@/lib/types';
import { calculateRiskScore, getRiskLevel } from '@/lib/risk-scoring';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const NewVisitForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);

  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [visitType, setVisitType] = useState<VisitType>('Routine');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [weight, setWeight] = useState('');
  const [fundalHeight, setFundalHeight] = useState('');
  const [proteinuria, setProteinuria] = useState<Proteinuria>('Negative');
  const [edema, setEdema] = useState<EdemaLevel>('None');
  const [headache, setHeadache] = useState<HeadacheLevel>('None');
  const [visualDisturbances, setVisualDisturbances] = useState(false);
  const [epigastricPain, setEpigastricPain] = useState(false);
  const [fetalMovement, setFetalMovement] = useState<FetalMovement>('Normal');
  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    if (id) setPatient(getPatient(id) || null);
  }, [id]);

  const gestationalAge = useMemo(() => {
    if (!patient) return 0;
    const lmp = new Date(patient.lmpDate);
    return Math.floor((visitDate.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000));
  }, [patient, visitDate]);

  const previousScore = patient?.visits.length ? patient.visits[patient.visits.length - 1].riskScore : undefined;

  const liveRiskScore = useMemo(() => {
    if (!systolic || !diastolic) return 0;
    return calculateRiskScore(
      parseInt(systolic), parseInt(diastolic),
      proteinuria, edema, headache, visualDisturbances, epigastricPain, fetalMovement, previousScore
    );
  }, [systolic, diastolic, proteinuria, edema, headache, visualDisturbances, epigastricPain, fetalMovement, previousScore]);

  const liveRiskLevel = getRiskLevel(liveRiskScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const visit: Visit = {
      id: `v${Date.now()}`,
      patientId: patient.id,
      visitNumber: patient.visits.length + 1,
      date: format(visitDate, 'yyyy-MM-dd'),
      gestationalAge,
      visitType,
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      weight: parseFloat(weight),
      fundalHeight: parseFloat(fundalHeight),
      proteinuria,
      edema,
      headache,
      visualDisturbances,
      epigastricPain,
      fetalMovement,
      clinicalNotes,
      riskScore: liveRiskScore,
      riskLevel: liveRiskLevel,
    };

    const updated = { ...patient, visits: [...patient.visits, visit], gestationalAge };
    savePatient(updated);

    if (previousScore !== undefined && liveRiskScore > previousScore + 15) {
      addAlert({
        id: `a${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        message: `Risk escalated from ${getRiskLevel(previousScore)} to ${liveRiskLevel}`,
        type: 'escalation',
        date: format(visitDate, 'yyyy-MM-dd'),
      });
    }

    toast({ title: 'Visit saved successfully' });
    navigate(`/patients/${patient.id}`);
  };

  if (!patient) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Patient not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">New Visit</h1>
            <p className="text-sm text-muted-foreground">{patient.name}</p>
          </div>
        </div>
      </div>

      <main className="container max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Risk Preview */}
          <Card className="border-2 border-primary">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score Preview</p>
                <p className="text-3xl font-bold">{liveRiskScore}</p>
              </div>
              <RiskBadge level={liveRiskLevel} score={liveRiskScore} size="lg" />
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Visit Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !visitDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {visitDate ? format(visitDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={visitDate} onSelect={(d) => d && setVisitDate(d)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Gestational Age</Label>
                <Input value={`${gestationalAge} weeks`} disabled />
              </div>
              <div>
                <Label>Visit Type</Label>
                <Select value={visitType} onValueChange={(v) => setVisitType(v as VisitType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Vitals</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>BP Systolic (mmHg)</Label>
                  <Input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="e.g., 120" required />
                </div>
                <div>
                  <Label>BP Diastolic (mmHg)</Label>
                  <Input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="e.g., 80" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g., 58" required />
                </div>
                <div>
                  <Label>Fundal Height (cm)</Label>
                  <Input type="number" step="0.1" value={fundalHeight} onChange={e => setFundalHeight(e.target.value)} placeholder="e.g., 28" required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Symptoms & Signs</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Proteinuria</Label>
                <Select value={proteinuria} onValueChange={(v) => setProteinuria(v as Proteinuria)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Negative', 'Trace', '1+', '2+', '3+'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Edema</Label>
                <RadioGroup value={edema} onValueChange={(v) => setEdema(v as EdemaLevel)}>
                  {(['None', 'Mild (feet only)', 'Moderate (legs)', 'Severe (face and hands)'] as EdemaLevel[]).map(v => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`edema-${v}`} />
                      <Label htmlFor={`edema-${v}`} className="font-normal">{v}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Headache</Label>
                <RadioGroup value={headache} onValueChange={(v) => setHeadache(v as HeadacheLevel)}>
                  {(['None', 'Mild', 'Moderate', 'Severe/persistent'] as HeadacheLevel[]).map(v => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`headache-${v}`} />
                      <Label htmlFor={`headache-${v}`} className="font-normal">{v}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <Label>Visual Disturbances</Label>
                <Switch checked={visualDisturbances} onCheckedChange={setVisualDisturbances} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Epigastric Pain</Label>
                <Switch checked={epigastricPain} onCheckedChange={setEpigastricPain} />
              </div>

              <div>
                <Label>Fetal Movement</Label>
                <Select value={fetalMovement} onValueChange={(v) => setFetalMovement(v as FetalMovement)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Normal', 'Reduced', 'Absent'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Clinical Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} placeholder="Additional observations..." rows={3} />
            </CardContent>
          </Card>

          <div className="flex gap-3 pb-6">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground border-0">Save Visit</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewVisitForm;
