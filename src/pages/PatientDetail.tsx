import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, initStorage, getPostpartumVisits } from '@/lib/storage';
import { Patient, Visit, PostpartumVisit } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskGauge } from '@/components/RiskGauge';
import { RiskSparkline } from '@/components/RiskSparkline';
import { RiskTrajectoryChart } from '@/components/RiskTrajectoryChart';
import { CompareVisits } from '@/components/CompareVisits';
import { ReferralTracker } from '@/components/ReferralTracker';
import { ImageCapture } from '@/components/ImageCapture';
import { ImageGallery } from '@/components/ImageGallery';
import { SyncStatusBar } from '@/components/SyncStatus';
import { Navbar } from '@/components/Navbar';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, CalendarDays, Stethoscope, User, Brain, ShieldAlert, CheckCircle2, Camera, MessageCircle, Send, X, ExternalLink, Share2, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Tooltip, Line } from 'recharts';


const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, tName } = useI18n();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [ppVisits, setPpVisits] = useState<PostpartumVisit[]>([]);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai'; text: string}[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initStorage();
    if (id) {
      setPatient(getPatient(id) || null);
      setPpVisits(getPostpartumVisits(id));
    }
  }, [id]);

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Patient not found</div>;
  }

  const lastVisit = patient.visits[patient.visits.length - 1];
  const prevVisit = patient.visits.length > 1 ? patient.visits[patient.visits.length - 2] : null;
  const isHighRisk = lastVisit?.riskLevel === 'HIGH';
  const hasEscalation = prevVisit && lastVisit && lastVisit.riskScore > prevVisit.riskScore;
  const riskChange = prevVisit && lastVisit ? lastVisit.riskScore - prevVisit.riskScore : null;

  // Mock AI responses (kept in English as specified)
  const mockAIResponses: Record<string, string> = {
    'explain g2 p0': 'Retrieved from WHO Guidelines: G2 (Gravida 2) means 2 pregnancies. P0 (Para 0) means 0 births reaching viability. This indicates a history of pregnancy loss and flags this pregnancy as high-risk.',
    'what is preeclampsia': 'Preeclampsia is a serious blood pressure disorder that can happen after the 20th week of pregnancy. It can cause organ damage and is a leading cause of maternal mortality if not caught early.',
    'when to refer': 'Retrieved from WHO Guidelines: Refer immediately if systolic BP ≥160 mmHg, diastolic ≥110 mmHg, proteinuria ≥2+, severe headache, visual disturbances, or epigastric pain. Do not delay transport.',
    'emergency signs': 'Look for severe headache, blurred vision, upper belly pain, and sudden swelling in the face or hands. These are danger signs that require immediate referral.',
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    const key = Object.keys(mockAIResponses).find(k => userMsg.toLowerCase().includes(k));
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: key ? mockAIResponses[key] : `I understand your question about "${userMsg}". In offline mode, I can answer common clinical queries. Try asking: "Explain G2 P0", "What is preeclampsia", or "When to refer".`
      }]);
    }, 800);
  };

  const chartData = patient.visits.map((v, i) => ({
    name: `Visit ${v.visitNumber}`,
    score: v.riskScore,
    systolic: v.systolic,
    date: v.date,
    ga: `${v.gestationalAge}wk`,
    riskLevel: v.riskLevel,
    escalation: i > 0 && v.riskScore - patient.visits[i - 1].riskScore > 20,
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
          <p className="text-xs text-muted-foreground mt-1">BP Systolic: <span className="font-semibold text-foreground">{data.systolic} mmHg</span></p>
          {data.escalation && (
            <p className="text-xs font-bold text-danger mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Escalation (&gt;20pt jump)
            </p>
          )}
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
        {payload.escalation && (
          <>
            <polygon
              points={`${cx},${cy - 22} ${cx - 6},${cy - 14} ${cx + 6},${cy - 14}`}
              fill="hsl(354, 70%, 54%)"
              stroke="white"
              strokeWidth={1}
            />
            <line x1={cx} y1={cy - 14} x2={cx} y2={cy - 10} stroke="hsl(354, 70%, 54%)" strokeWidth={2} />
          </>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SyncStatusBar />
      <div className="container max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{tName(patient.name)}</h1>
            <p className="text-sm text-muted-foreground">
              {patient.age}y · G{patient.gravida}P{patient.para} · {patient.gestationalAge}wk
            </p>
          </div>
        </div>
      </div>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Escalation Banner */}
        {hasEscalation && isHighRisk && (
          <div className="escalation-banner rounded-xl bg-danger p-4 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="h-6 w-6 text-white shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">⚠️ {t('escalation.detected')}</p>
              <p className="text-white/90 text-xs mt-1">
                Risk increased from {prevVisit?.riskLevel} (Visit {prevVisit?.visitNumber}) to {lastVisit.riskLevel} (Visit {lastVisit.visitNumber}). {t('escalation.urgentReferral')}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 text-white shrink-0 mt-0.5" />
          </div>
        )}

        {/* Animated Risk Gauge */}
        {lastVisit && (
          <Card className="card-gradient border-0 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <RiskGauge score={lastVisit.riskScore} size={200} />
              {riskChange !== null && riskChange !== 0 && prevVisit && (
                <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${riskChange > 0 ? 'text-danger-foreground' : 'text-success-foreground'}`}>
                  {riskChange > 0 ? '↑' : '↓'} {Math.abs(Math.round((riskChange / (prevVisit.riskScore || 1)) * 100))}% since Visit {prevVisit.visitNumber}
                </p>
              )}
              {patient.visits.length >= 2 && (
                <div className="mt-3">
                  <RiskSparkline visits={patient.visits} />
                </div>
              )}
              <a
                href="https://www.who.int/publications/i/item/9789241549912"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-[10px] text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                View Clinical Source: WHO Antenatal Guidelines
              </a>
            </CardContent>
          </Card>
        )}

        {/* Risk Trajectory Chart */}
        {lastVisit && (
          <RiskTrajectoryChart currentScore={lastVisit.riskScore} visitNumber={lastVisit.visitNumber} />
        )}

        {/* HERO: Risk & BP Trend Chart */}
        {chartData.length > 1 && (
          <div>
            <Card className="card-gradient-primary border-2 border-primary/20 shadow-lg overflow-hidden">
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('patient.riskBpTrends')}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {chartData.length} {t('common.views')} · {patient.visits[0].date} → {lastVisit.date}
                      </p>
                    </div>
                  </div>
                  {lastVisit && <RiskBadge level={lastVisit.riskLevel} score={lastVisit.riskScore} size="md" showIcon />}
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-4 pt-0">
                <div className="flex items-center justify-between mb-3 py-2 px-3 mx-2 bg-muted/60 rounded-xl">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">First</p>
                    <RiskBadge level={patient.visits[0].riskLevel} score={patient.visits[0].riskScore} size="sm" />
                  </div>
                  <div className="flex-1 mx-3 h-2 rounded-full overflow-hidden bg-border">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${lastVisit.riskScore}%`,
                        background: 'linear-gradient(90deg, hsl(134, 61%, 41%), hsl(45, 100%, 51%), hsl(354, 70%, 54%))',
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latest</p>
                    <RiskBadge level={lastVisit.riskLevel} score={lastVisit.riskScore} size="sm" />
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 15, right: 10, bottom: 5, left: -10 }}>
                      <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(354, 70%, 54%)" stopOpacity={0.25} />
                          <stop offset="40%" stopColor="hsl(45, 100%, 51%)" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="hsl(134, 61%, 41%)" stopOpacity={0.03} />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(134, 61%, 41%)" />
                          <stop offset="50%" stopColor="hsl(45, 100%, 51%)" />
                          <stop offset="100%" stopColor="hsl(354, 70%, 54%)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-20" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="risk" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="bp" orientation="right" domain={[80, 200]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} hide />
                      <Tooltip content={<CustomTooltip />} />

                      <ReferenceLine yAxisId="risk" y={70} stroke="hsl(354, 70%, 54%)" strokeDasharray="6 3" strokeWidth={1.5}
                        label={{ value: 'HIGH', position: 'insideTopRight', fontSize: 9, fill: 'hsl(354, 70%, 54%)', fontWeight: 700 }}
                      />
                      <ReferenceLine yAxisId="risk" y={40} stroke="hsl(45, 100%, 51%)" strokeDasharray="6 3" strokeWidth={1.5}
                        label={{ value: 'MODERATE', position: 'insideTopRight', fontSize: 9, fill: 'hsl(45, 100%, 51%)', fontWeight: 700 }}
                      />

                      <Area yAxisId="risk" type="monotone" dataKey="score" fill="url(#riskGradient)" stroke="none" />
                      <Area yAxisId="risk" type="monotone" dataKey="score" fill="none" stroke="url(#lineGradient)" strokeWidth={3} dot={<CustomDot />} activeDot={{ r: 10, fill: 'hsl(231, 80%, 66%)', stroke: 'white', strokeWidth: 3 }} />
                      <Line yAxisId="bp" type="monotone" dataKey="systolic" stroke="hsl(231, 80%, 66%)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: 'hsl(231, 80%, 66%)', stroke: 'white', strokeWidth: 1 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground px-2">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" />Low (0-39)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />Moderate (40-69)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />High (70+)</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-4 border-t-2 border-dashed" style={{ borderColor: 'hsl(231, 80%, 66%)' }} />BP Systolic</span>
                  <span className="flex items-center gap-1"><span className="text-danger">▲</span>Escalation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patient Info */}
        <Card className="card-gradient border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{t('patient.info')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">{t('patient.village')}:</span> <span className="font-medium">{patient.village}</span></div>
              <div><span className="text-muted-foreground">{t('patient.phone')}:</span> <span className="font-medium">{patient.phone}</span></div>
              <div><span className="text-muted-foreground">{t('patient.fchv')}:</span> <span className="font-medium">{patient.fchvAssigned}</span></div>
              <div><span className="text-muted-foreground">{t('patient.registered')}:</span> <span className="font-medium">{patient.registrationDate}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Timeline */}
        {patient.visits.length > 0 && (
          <Card className="card-gradient border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{t('patient.visitTimeline')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max py-3">
                  {patient.visits.map((visit, i) => (
                    <div key={visit.id} className="flex items-center">
                      <div
                        className="flex flex-col items-center cursor-pointer group timeline-dot-appear"
                        style={{ animationDelay: `${i * 200 + 300}ms` }}
                        onClick={() => navigate(`/patients/${patient.id}/visits/${visit.id}`)}
                      >
                        <div
                          className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-shadow duration-200 group-hover:shadow-md ${
                            visit.riskLevel === 'LOW' ? 'border-success bg-success-bg text-success-foreground' :
                            visit.riskLevel === 'MODERATE' ? 'border-warning bg-warning-bg text-warning-foreground' :
                            'border-danger bg-danger-bg text-danger-foreground'
                          } ${visit.riskLevel === 'HIGH' ? 'pulse-red' : ''}`}
                        >
                          V{visit.visitNumber}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{visit.date.slice(5)}</p>
                        <p className="text-xs text-muted-foreground">{visit.gestationalAge}wk</p>
                        <RiskBadge level={visit.riskLevel} size="sm" className="mt-1" />
                      </div>
                      {i < patient.visits.length - 1 && (
                        <div className="relative mx-1">
                          <div
                            className={`h-0.5 timeline-line-draw ${
                              patient.visits[i + 1].riskScore > visit.riskScore ? 'bg-danger/40' : 'bg-success/40'
                            }`}
                            style={{ animationDelay: `${i * 200 + 500}ms` }}
                          />
                          <ChevronRight
                            className={`h-3 w-3 absolute -right-1 -top-[5px] timeline-dot-appear ${
                              patient.visits[i + 1].riskScore > visit.riskScore ? 'text-danger' : 'text-success'
                            }`}
                            style={{ animationDelay: `${(i + 1) * 200 + 300}ms` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Symptom Trends Table */}
        {patient.visits.length > 0 && (
          <Card className="card-gradient border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{t('patient.symptomTrends')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">{t('vitals.symptom')}</th>
                      {patient.visits.map(v => (
                        <th key={v.id} className="p-3 font-medium text-muted-foreground text-center">V{v.visitNumber}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">{t('vitals.bp')}</td>
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
                      <td className="p-3 font-medium">{t('vitals.proteinuria')}</td>
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
                      <td className="p-3 font-medium">{t('vitals.edema')}</td>
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
                      <td className="p-3 font-medium">{t('vitals.headache')}</td>
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

        {/* Referral Tracking */}
        <ReferralTracker patientId={patient.id} />

        {/* Postpartum Screening Results */}
        {ppVisits.length > 0 && (
          <Card className="border-2 border-[hsl(280,60%,50%)]/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[hsl(280,60%,50%)]" />
                <CardTitle className="text-base">{t('postpartum.results')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {ppVisits.map(ppv => {
                const riskConfig = ppv.ppdRisk === 'high'
                  ? { color: 'text-danger-foreground', bg: 'bg-danger-bg', border: 'border-danger', icon: ShieldAlert, label: 'High PPD Risk' }
                  : ppv.ppdRisk === 'moderate'
                  ? { color: 'text-warning-foreground', bg: 'bg-warning-bg', border: 'border-warning', icon: AlertTriangle, label: 'Moderate PPD Risk' }
                  : { color: 'text-success-foreground', bg: 'bg-success-bg', border: 'border-success', icon: CheckCircle2, label: 'Low PPD Risk' };
                const Icon = riskConfig.icon;
                return (
                  <div key={ppv.id} className={`flex items-center justify-between p-3 rounded-xl ${riskConfig.bg} border ${riskConfig.border}`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${riskConfig.color}`} />
                      <div>
                        <p className={`text-xs font-semibold ${riskConfig.color}`}>{riskConfig.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ppv.date} · {ppv.weeksPostpartum}wk postpartum · Score: {ppv.edinburghScore}/10</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Image Capture */}
        {showImageCapture && (
          <ImageCapture
            patientId={patient.id}
            patientName={patient.name}
            onCapture={() => setShowImageCapture(false)}
            onClose={() => setShowImageCapture(false)}
          />
        )}

        {/* Image Gallery */}
        <ImageGallery patientId={patient.id} />

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6">
          {/* Export Referral Package button */}
          {lastVisit && (
            <Button
              className="bg-gradient-to-r from-primary to-[hsl(200,80%,50%)] text-primary-foreground border-0 h-12"
              onClick={() => setShowExport(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t('export.title')}
            </Button>
          )}
          <Button className="gradient-primary text-primary-foreground border-0 h-12" onClick={() => navigate(`/patients/${patient.id}/visits/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('patient.addNewVisit')}
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl"
            onClick={() => setShowImageCapture(true)}
          >
            <Camera className="h-4 w-4 mr-2" />
            {t('patient.captureImage')}
          </Button>
          <Button
            className="bg-gradient-to-r from-[hsl(280,60%,50%)] to-[hsl(320,60%,50%)] text-primary-foreground border-0 h-12"
            onClick={() => navigate(`/patients/${patient.id}/postpartum`)}
          >
            <Brain className="h-4 w-4 mr-2" />
            {t('patient.postpartumScreening')}
          </Button>
          {isHighRisk && (
            <Button className="gradient-danger text-primary-foreground border-0 h-12" onClick={() => navigate(`/patients/${patient.id}/referral`)}>
              <FileText className="h-4 w-4 mr-2" />
              {t('patient.generateReferral')}
            </Button>
          )}
          {patient.visits.length >= 2 && (
            <CompareVisits visits={patient.visits} />
          )}
        </div>
      </main>

      {/* Export Referral Modal */}
      {lastVisit && (() => {
        const symptoms = [
          lastVisit.edema !== 'None' ? `Edema: ${lastVisit.edema}` : null,
          lastVisit.headache !== 'None' ? `Headache: ${lastVisit.headache}` : null,
          lastVisit.visualDisturbances ? 'Visual Disturbances' : null,
          lastVisit.proteinuria !== 'Negative' ? `Proteinuria: ${lastVisit.proteinuria}` : null,
        ].filter(Boolean).join(', ') || 'None noted';
        const exportText = `MATRICARE REFERRAL: Patient: ${patient.name}. Risk Score: ${lastVisit.riskScore}/100 (${lastVisit.riskLevel}). History: G${patient.gravida} P${patient.para}. BP: ${lastVisit.systolic}/${lastVisit.diastolic}. Symptoms: ${symptoms}. Images attached in portal. Please prioritize for triage.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(exportText)}`;
        const smsUrl = `sms:?body=${encodeURIComponent(exportText)}`;

        return (
          <Dialog open={showExport} onOpenChange={setShowExport}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  {t('export.title')}
                </DialogTitle>
              </DialogHeader>
              <div className="bg-muted rounded-xl p-3 text-xs leading-relaxed font-mono">
                {exportText}
              </div>
              <div className="flex flex-col gap-2">
                <Button className="h-10 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white" onClick={() => window.open(whatsappUrl, '_blank')}>
                  <Send className="h-4 w-4 mr-2" />
                  {t('export.share')}
                </Button>
                <Button variant="outline" className="h-10" onClick={() => window.open(smsUrl, '_blank')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('export.sms')}
                </Button>
                <Button
                  variant="secondary"
                  className="h-10"
                  onClick={() => {
                    navigator.clipboard.writeText(exportText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? t('export.copied') : t('export.copy')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Clinical Assistant FAB - always visible with z-[9999] */}
      <button
        onClick={() => setShowChat(prev => !prev)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary text-primary-foreground flex items-center justify-center z-[9999] fab-pulse btn-press"
      >
        {showChat ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-4 w-80 max-h-[420px] bg-card border border-border rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-scale-in">
          <div className="gradient-primary p-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
            <div className="flex-1">
              <p className="text-xs font-bold text-primary-foreground">MatriCare Local-AI</p>
              <p className="text-[9px] text-primary-foreground/70">Offline Mode · WHO Guidelines</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[280px]">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Ask a clinical question</p>
                <p className="text-[10px] text-muted-foreground mt-1">Try: "Explain G2 P0"</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-2 flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Ask about clinical terms..."
              className="text-xs h-8 rounded-xl"
            />
            <Button size="icon" className="h-8 w-8 rounded-xl shrink-0" onClick={handleChatSend}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
