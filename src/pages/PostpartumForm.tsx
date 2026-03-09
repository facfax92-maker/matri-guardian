import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, savePostpartumVisit, addAlert, initStorage } from '@/lib/storage';
import { Patient, PostpartumVisit, EdinburghAnswer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Brain, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useEffect } from 'react';

const edinburghQuestions = [
  { id: 1, text: 'I have been able to laugh and see the funny side of things', positive: 'Yes, as much as ever', sometimes: 'Not quite so much now', negative: 'Not at all', reverseScore: false },
  { id: 2, text: 'I have looked forward with enjoyment to things', positive: 'As much as I ever did', sometimes: 'Less than I used to', negative: 'Hardly at all', reverseScore: false },
  { id: 3, text: 'I have blamed myself unnecessarily when things went wrong', positive: 'No, never', sometimes: 'Not very often', negative: 'Yes, most of the time', reverseScore: true },
  { id: 4, text: 'I have been anxious or worried for no good reason', positive: 'No, not at all', sometimes: 'Hardly ever', negative: 'Yes, quite a lot', reverseScore: true },
  { id: 5, text: 'I have felt scared or panicky for no good reason', positive: 'No, not at all', sometimes: 'No, not much', negative: 'Yes, quite a lot', reverseScore: true },
];

function scoreAnswer(answer: EdinburghAnswer, reverseScore: boolean): number {
  if (reverseScore) {
    return answer === 'negative' ? 2 : answer === 'sometimes' ? 1 : 0;
  }
  return answer === 'negative' ? 2 : answer === 'sometimes' ? 1 : 0;
}

function getPPDRisk(score: number): 'low' | 'moderate' | 'high' {
  if (score >= 7) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
}

const ppdRiskConfig = {
  low: { label: 'Low PPD Risk', color: 'text-success-foreground', bg: 'bg-success-bg', border: 'border-success', icon: CheckCircle2 },
  moderate: { label: 'Moderate PPD Risk', color: 'text-warning-foreground', bg: 'bg-warning-bg', border: 'border-warning', icon: AlertTriangle },
  high: { label: 'High PPD Risk — Counseling Recommended', color: 'text-danger-foreground', bg: 'bg-danger-bg', border: 'border-danger', icon: ShieldAlert },
};

const PostpartumForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [weeksPostpartum, setWeeksPostpartum] = useState(2);
  const [answers, setAnswers] = useState<(EdinburghAnswer | null)[]>([null, null, null, null, null]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    initStorage();
    if (id) setPatient(getPatient(id) || null);
  }, [id]);

  if (!patient) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Patient not found</div>;

  const allAnswered = answers.every(a => a !== null);
  const totalScore = answers.reduce((sum, a, i) => sum + (a ? scoreAnswer(a, edinburghQuestions[i].reverseScore) : 0), 0);
  const risk = getPPDRisk(totalScore);
  const riskInfo = ppdRiskConfig[risk];
  const RiskIcon = riskInfo.icon;

  const handleSubmit = () => {
    if (!allAnswered) return;

    const visit: PostpartumVisit = {
      id: `pp${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      weeksPostpartum,
      edinburghAnswers: answers as EdinburghAnswer[],
      edinburghScore: totalScore,
      ppdRisk: risk,
      notes,
    };

    savePostpartumVisit(visit);

    if (risk === 'high') {
      addAlert({
        id: `alert-ppd-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        message: `High PPD risk detected (score: ${totalScore}/10). Counseling referral recommended.`,
        type: 'ppd',
        date: new Date().toISOString().split('T')[0],
      });
    }

    setSubmitted(true);
    toast({ title: 'Postpartum screening saved', description: `PPD Risk: ${riskInfo.label}` });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full ${riskInfo.bg} mb-4`}>
              <RiskIcon className={`h-10 w-10 ${riskInfo.color}`} />
            </div>
            <h1 className="text-2xl font-bold">Screening Complete</h1>
            <p className="text-muted-foreground mt-2">Edinburgh Score: {totalScore}/10</p>
            <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${riskInfo.bg} ${riskInfo.color} border ${riskInfo.border} font-semibold text-sm`}>
              <RiskIcon className="h-4 w-4" />
              {riskInfo.label}
            </div>
          </div>

          {risk === 'high' && (
            <Card className="border-2 border-danger/30 bg-danger-bg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-danger-foreground">Counseling Referral Recommended</p>
                    <p className="text-sm text-danger-foreground mt-1">
                      This patient shows signs consistent with postpartum depression. Please arrange a counseling referral and follow up within 1 week.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3">
            <Button className="gradient-primary text-primary-foreground border-0 h-12" onClick={() => navigate(`/patients/${patient.id}`)}>
              Back to Patient
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-[hsl(280,60%,50%)] to-[hsl(320,60%,50%)] px-4 py-4 text-primary-foreground" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Postpartum Screening</h1>
            <p className="text-sm opacity-90">{patient.name}</p>
          </div>
          <Brain className="h-5 w-5 opacity-80" />
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Visit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Weeks Postpartum</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={weeksPostpartum}
                onChange={e => setWeeksPostpartum(parseInt(e.target.value) || 2)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Edinburgh Postnatal Depression Scale</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Simplified 5-question screening</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {edinburghQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="space-y-2"
              >
                <p className="text-sm font-medium">
                  {q.id}. {q.text}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['positive', 'sometimes', 'negative'] as EdinburghAnswer[]).map(answer => {
                    const label = q[answer];
                    const isSelected = answers[idx] === answer;
                    return (
                      <button
                        key={answer}
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[idx] = answer;
                          setAnswers(newAnswers);
                        }}
                        className={`p-2 rounded-xl text-xs text-center transition-all border-2 ${
                          isSelected
                            ? answer === 'positive' ? 'bg-success-bg text-success-foreground border-success'
                            : answer === 'sometimes' ? 'bg-warning-bg text-warning-foreground border-warning'
                            : 'bg-danger-bg text-danger-foreground border-danger'
                            : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live score preview */}
        {allAnswered && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={`border-2 ${riskInfo.border}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <RiskIcon className={`h-6 w-6 ${riskInfo.color}`} />
                <div>
                  <p className={`font-bold ${riskInfo.color}`}>{riskInfo.label}</p>
                  <p className="text-xs text-muted-foreground">Score: {totalScore}/10</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional observations about mother's mental health..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pb-6">
          <Button
            className="bg-gradient-to-r from-[hsl(280,60%,50%)] to-[hsl(320,60%,50%)] text-primary-foreground border-0 h-12"
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Submit Screening
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </main>
    </div>
  );
};

export default PostpartumForm;
