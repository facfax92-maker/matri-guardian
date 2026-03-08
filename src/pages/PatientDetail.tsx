import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, initStorage } from '@/lib/storage';
import { Patient, Visit } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { motion } from 'framer-motion';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    initStorage();
    if (id) setPatient(getPatient(id) || null);
  }, [id]);

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Patient not found</div>;
  }

  const lastVisit = patient.visits[patient.visits.length - 1];
  const prevVisit = patient.visits.length > 1 ? patient.visits[patient.visits.length - 2] : null;
  const isHighRisk = lastVisit?.riskLevel === 'HIGH';
  const hasEscalation = prevVisit && lastVisit && lastVisit.riskScore > prevVisit.riskScore;

  const chartData = patient.visits.map(v => ({
    name: `Visit ${v.visitNumber}`,
    score: v.riskScore,
    date: v.date,
    ga: v.gestationalAge,
  }));

  const trendIcon = (current: string | number | boolean, previous: string | number | boolean | undefined, higherIsWorse = true) => {
    if (previous === undefined) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (current === previous) return <Minus className="h-3 w-3 text-muted-foreground" />;
    const isWorse = higherIsWorse ? current > previous : current < previous;
    return isWorse
      ? <TrendingUp className="h-3 w-3 text-danger" />
      : <TrendingDown className="h-3 w-3 text-success" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{patient.name}</h1>
            <p className="text-sm opacity-90">
              {patient.age}y · G{patient.gravida}P{patient.para} · {patient.gestationalAge}wk
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Risk Escalation Alert */}
        {hasEscalation && isHighRisk && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-danger bg-danger-bg">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-danger-foreground">⚠️ RISK ESCALATION DETECTED</p>
                  <p className="text-sm text-danger-foreground mt-1">
                    Risk increased from {prevVisit?.riskLevel} (Visit {prevVisit?.visitNumber}) to {lastVisit.riskLevel} (Visit {lastVisit.visitNumber})
                  </p>
                  <p className="text-sm font-medium text-danger-foreground mt-1">Urgent referral recommended</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Patient Info */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Village:</span> <span className="font-medium">{patient.village}</span></div>
              <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{patient.phone}</span></div>
              <div><span className="text-muted-foreground">FCHV:</span> <span className="font-medium">{patient.fchvAssigned}</span></div>
              <div><span className="text-muted-foreground">Registered:</span> <span className="font-medium">{patient.registrationDate}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Timeline */}
        {patient.visits.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Visit Timeline</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max py-3">
                  {patient.visits.map((visit, i) => (
                    <div key={visit.id} className="flex items-center">
                      <div
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => navigate(`/patients/${patient.id}/visits/${visit.id}`)}
                      >
                        <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${
                          visit.riskLevel === 'LOW' ? 'border-success bg-success-bg text-success-foreground' :
                          visit.riskLevel === 'MODERATE' ? 'border-warning bg-warning-bg text-warning-foreground' :
                          'border-danger bg-danger-bg text-danger-foreground'
                        }`}>
                          V{visit.visitNumber}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{visit.date.slice(5)}</p>
                        <p className="text-xs text-muted-foreground">{visit.gestationalAge}wk</p>
                        <RiskBadge level={visit.riskLevel} size="sm" className="mt-1" />
                      </div>
                      {i < patient.visits.length - 1 && (
                        <div className="w-12 h-0.5 bg-border mx-1 relative">
                          <ChevronRight className="h-3 w-3 text-muted-foreground absolute -right-1 -top-[5px]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Trend Chart */}
        {chartData.length > 1 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Risk Trend</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <ReferenceLine y={70} stroke="hsl(354, 70%, 54%)" strokeDasharray="4 4" label={{ value: 'HIGH', position: 'right', fontSize: 10, fill: 'hsl(354, 70%, 54%)' }} />
                    <ReferenceLine y={40} stroke="hsl(45, 100%, 51%)" strokeDasharray="4 4" label={{ value: 'MOD', position: 'right', fontSize: 10, fill: 'hsl(45, 100%, 51%)' }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(231, 80%, 66%)"
                      strokeWidth={3}
                      dot={{ r: 6, fill: 'hsl(231, 80%, 66%)' }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Symptom Trends Table */}
        {patient.visits.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Symptom Trends</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">Symptom</th>
                      {patient.visits.map(v => (
                        <th key={v.id} className="p-3 font-medium text-muted-foreground text-center">V{v.visitNumber}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Blood Pressure</td>
                      {patient.visits.map((v, i) => (
                        <td key={v.id} className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs">{v.systolic}/{v.diastolic}</span>
                            {i > 0 && trendIcon(v.systolic, patient.visits[i-1].systolic)}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Proteinuria</td>
                      {patient.visits.map((v, i) => (
                        <td key={v.id} className="p-3 text-center text-xs">
                          <div className="flex items-center justify-center gap-1">
                            {v.proteinuria}
                            {i > 0 && trendIcon(
                              ['Negative','Trace','1+','2+','3+'].indexOf(v.proteinuria),
                              ['Negative','Trace','1+','2+','3+'].indexOf(patient.visits[i-1].proteinuria)
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Edema</td>
                      {patient.visits.map((v, i) => (
                        <td key={v.id} className="p-3 text-center text-xs">
                          <div className="flex items-center justify-center gap-1">
                            {v.edema.split(' ')[0]}
                            {i > 0 && trendIcon(
                              ['None','Mild (feet only)','Moderate (legs)','Severe (face and hands)'].indexOf(v.edema),
                              ['None','Mild (feet only)','Moderate (legs)','Severe (face and hands)'].indexOf(patient.visits[i-1].edema)
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Headache</td>
                      {patient.visits.map((v, i) => (
                        <td key={v.id} className="p-3 text-center text-xs">
                          <div className="flex items-center justify-center gap-1">
                            {v.headache.split('/')[0]}
                            {i > 0 && trendIcon(
                              ['None','Mild','Moderate','Severe/persistent'].indexOf(v.headache),
                              ['None','Mild','Moderate','Severe/persistent'].indexOf(patient.visits[i-1].headache)
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6">
          <Button className="gradient-primary text-primary-foreground border-0 h-12" onClick={() => navigate(`/patients/${patient.id}/visits/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Visit
          </Button>
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

export default PatientDetail;
