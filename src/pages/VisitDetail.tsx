import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, initStorage } from '@/lib/storage';
import { Patient, Visit } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, TrendingUp, TrendingDown, Minus, Check, X } from 'lucide-react';
import { getRiskLevel } from '@/lib/risk-scoring';

const VisitDetail = () => {
  const { id, visitId } = useParams<{ id: string; visitId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [prevVisit, setPrevVisit] = useState<Visit | null>(null);

  useEffect(() => {
    initStorage();
    if (id) {
      const p = getPatient(id);
      if (p) {
        setPatient(p);
        const v = p.visits.find(v => v.id === visitId);
        if (v) {
          setVisit(v);
          const idx = p.visits.findIndex(vi => vi.id === visitId);
          if (idx > 0) setPrevVisit(p.visits[idx - 1]);
        }
      }
    }
  }, [id, visitId]);

  if (!patient || !visit) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Visit not found</div>;
  }

  const isHighRisk = visit.riskLevel === 'HIGH';

  const compare = (current: number, previous: number | undefined, unit: string) => {
    if (previous === undefined) return <span className="text-muted-foreground text-xs">—</span>;
    const diff = current - previous;
    if (diff === 0) return <span className="text-muted-foreground text-xs flex items-center gap-1"><Minus className="h-3 w-3" />No change</span>;
    const isUp = diff > 0;
    return (
      <span className={`text-xs flex items-center gap-1 ${isUp ? 'text-danger' : 'text-success'}`}>
        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isUp ? '+' : ''}{diff}{unit} vs prev
      </span>
    );
  };

  // WHO preeclampsia criteria check
  const criteria = [
    { label: 'Elevated BP (≥140/90)', met: visit.systolic >= 140 || visit.diastolic >= 90 },
    { label: 'Proteinuria present', met: visit.proteinuria !== 'Negative' },
    { label: 'Edema present', met: visit.edema !== 'None' },
    { label: 'Severe headache', met: visit.headache === 'Severe/persistent' || visit.headache === 'Moderate' },
    { label: 'Visual disturbances', met: visit.visualDisturbances },
    { label: 'Epigastric pain', met: visit.epigastricPain },
  ];
  const metCount = criteria.filter(c => c.met).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate(`/patients/${patient.id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Visit {visit.visitNumber}</h1>
            <p className="text-sm opacity-90">{patient.name} · {visit.date}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Summary */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Risk Assessment</p>
            <RiskBadge level={visit.riskLevel} score={visit.riskScore} size="lg" />
            <p className="text-sm text-muted-foreground mt-3">{visit.visitType} · {visit.gestationalAge} weeks GA</p>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Vitals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Blood Pressure</span>
              <div className="text-right">
                <span className="font-semibold">{visit.systolic}/{visit.diastolic} mmHg</span>
                <div>{compare(visit.systolic, prevVisit?.systolic, ' mmHg')}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Weight</span>
              <div className="text-right">
                <span className="font-semibold">{visit.weight} kg</span>
                <div>{compare(visit.weight, prevVisit?.weight, ' kg')}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Fundal Height</span>
              <span className="font-semibold">{visit.fundalHeight} cm</span>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Symptoms</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Proteinuria', value: visit.proteinuria },
              { label: 'Edema', value: visit.edema },
              { label: 'Headache', value: visit.headache },
              { label: 'Visual Disturbances', value: visit.visualDisturbances ? 'Yes' : 'No' },
              { label: 'Epigastric Pain', value: visit.epigastricPain ? 'Yes' : 'No' },
              { label: 'Fetal Movement', value: visit.fetalMovement },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Clinical Assessment */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Clinical Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">{metCount} of {criteria.length} preeclampsia criteria met</p>
            <div className="space-y-1">
              {criteria.map(c => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  {c.met ? <Check className="h-4 w-4 text-danger" /> : <X className="h-4 w-4 text-muted-foreground" />}
                  <span className={c.met ? 'font-medium' : 'text-muted-foreground'}>{c.label}</span>
                </div>
              ))}
            </div>
            {metCount >= 3 && (
              <div className="bg-danger-bg border border-danger rounded-lg p-3 mt-2">
                <p className="text-sm font-semibold text-danger-foreground">
                  Provisional: {metCount >= 5 ? 'Severe Preeclampsia' : 'Gestational Hypertension / Preeclampsia'}
                </p>
                <p className="text-xs text-danger-foreground mt-1">Referral to higher facility recommended</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {visit.clinicalNotes && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{visit.clinicalNotes}</p></CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6">
          {isHighRisk && (
            <Button className="gradient-danger text-primary-foreground border-0 h-12" onClick={() => navigate(`/patients/${patient.id}/referral`)}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Referral
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default VisitDetail;
