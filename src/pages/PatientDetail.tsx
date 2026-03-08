import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, initStorage } from '@/lib/storage';
import { Patient, Visit } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { CompareVisits } from '@/components/CompareVisits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Tooltip } from 'recharts';
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
    ga: `${v.gestationalAge}wk`,
    riskLevel: v.riskLevel,
  }));

  const trendIcon = (current: string | number | boolean, previous: string | number | boolean | undefined, higherIsWorse = true) => {
    if (previous === undefined) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (current === previous) return <Minus className="h-3 w-3 text-muted-foreground" />;
    const isWorse = higherIsWorse ? current > previous : current < previous;
    return isWorse
      ? <TrendingUp className="h-3 w-3 text-danger" />
      : <TrendingDown className="h-3 w-3 text-success" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold">{data.name}</p>
          <p className="text-muted-foreground">{data.date} · {data.ga}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-bold text-lg">{data.score}</span>
            <RiskBadge level={data.riskLevel} size="sm" animate={false} />
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = payload.riskLevel === 'HIGH' ? 'hsl(354, 70%, 54%)' : payload.riskLevel === 'MODERATE' ? 'hsl(45, 100%, 51%)' : 'hsl(134, 61%, 41%)';
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.2} />
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{patient.name}</h1>
            <p className="text-sm opacity-90">
              {patient.age}y · G{patient.gravida}P{patient.para} · {patient.gestationalAge}wk
            </p>
          </div>
          {lastVisit && <RiskBadge level={lastVisit.riskLevel} score={lastVisit.riskScore} size="md" />}
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
                    <motion.div
                      key={visit.id}
                      className="flex items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <div
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => navigate(`/patients/${patient.id}/visits/${visit.id}`)}
                      >
                        <motion.div
                          className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${
                            visit.riskLevel === 'LOW' ? 'border-success bg-success-bg text-success-foreground' :
                            visit.riskLevel === 'MODERATE' ? 'border-warning bg-warning-bg text-warning-foreground' :
                            'border-danger bg-danger-bg text-danger-foreground'
                          }`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          V{visit.visitNumber}
                        </motion.div>
                        <p className="text-xs text-muted-foreground mt-1">{visit.date.slice(5)}</p>
                        <p className="text-xs text-muted-foreground">{visit.gestationalAge}wk</p>
                        <RiskBadge level={visit.riskLevel} size="sm" className="mt-1" />
                      </div>
                      {i < patient.visits.length - 1 && (
                        <motion.div
                          className={`w-12 h-0.5 mx-1 relative ${
                            patient.visits[i + 1].riskScore > visit.riskScore ? 'bg-danger/40' : 'bg-success/40'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.15 + 0.1 }}
                        >
                          <ChevronRight className={`h-3 w-3 absolute -right-1 -top-[5px] ${
                            patient.visits[i + 1].riskScore > visit.riskScore ? 'text-danger' : 'text-success'
                          }`} />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Trend Chart — Hero */}
        {chartData.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Risk Trend Analysis</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tracking risk progression across {chartData.length} visits
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {/* Risk score summary bar */}
                <div className="flex items-center justify-between mb-4 py-2 px-3 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">First Visit</p>
                    <RiskBadge level={patient.visits[0].riskLevel} score={patient.visits[0].riskScore} size="sm" />
                  </div>
                  <div className="flex-1 mx-3 h-1.5 rounded-full overflow-hidden bg-border">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${lastVisit.riskScore}%`,
                        background: lastVisit.riskLevel === 'HIGH'
                          ? 'linear-gradient(90deg, hsl(134, 61%, 41%), hsl(45, 100%, 51%), hsl(354, 70%, 54%))'
                          : lastVisit.riskLevel === 'MODERATE'
                          ? 'linear-gradient(90deg, hsl(134, 61%, 41%), hsl(45, 100%, 51%))'
                          : 'hsl(134, 61%, 41%)',
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Latest</p>
                    <RiskBadge level={lastVisit.riskLevel} score={lastVisit.riskScore} size="sm" />
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                      <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(354, 70%, 54%)" stopOpacity={0.3} />
                          <stop offset="40%" stopColor="hsl(45, 100%, 51%)" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="hsl(134, 61%, 41%)" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(134, 61%, 41%)" />
                          <stop offset="50%" stopColor="hsl(45, 100%, 51%)" />
                          <stop offset="100%" stopColor="hsl(354, 70%, 54%)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-20" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />

                      {/* Zone backgrounds */}
                      <ReferenceLine y={70} stroke="hsl(354, 70%, 54%)" strokeDasharray="6 3" strokeWidth={1.5}
                        label={{ value: 'HIGH RISK', position: 'insideTopRight', fontSize: 9, fill: 'hsl(354, 70%, 54%)', fontWeight: 600 }}
                      />
                      <ReferenceLine y={40} stroke="hsl(45, 100%, 51%)" strokeDasharray="6 3" strokeWidth={1.5}
                        label={{ value: 'MODERATE', position: 'insideTopRight', fontSize: 9, fill: 'hsl(45, 100%, 51%)', fontWeight: 600 }}
                      />

                      <Area
                        type="monotone"
                        dataKey="score"
                        fill="url(#riskGradient)"
                        stroke="none"
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={<CustomDot />}
                        activeDot={{ r: 10, fill: 'hsl(231, 80%, 66%)', stroke: 'white', strokeWidth: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" />Low (0-39)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />Moderate (40-69)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />High (70+)</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
          {patient.visits.length >= 2 && (
            <CompareVisits visits={patient.visits} />
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDetail;
