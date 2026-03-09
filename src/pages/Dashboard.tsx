import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getAlerts, initStorage } from '@/lib/storage';
import { Patient, Alert, RiskLevel } from '@/lib/types';
import { SyncStatusBar, SyncStatusIndicator } from '@/components/SyncStatus';
import { RiskBadge } from '@/components/RiskBadge';
import { migrateFromLocalStorage } from '@/lib/indexed-db';
import { getOverdueStatus } from '@/lib/visit-utils';
import { FCHVNotifications } from '@/components/FCHVNotifications';
import { Navbar } from '@/components/Navbar';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Plus, ChevronRight, PieChart, Bell, CalendarClock, Stethoscope } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initStorage();
    migrateFromLocalStorage().catch(() => {});
    // Simulate async data loading for skeleton visibility
    const timer = setTimeout(() => {
      setPatients(getPatients());
      setAlerts(getAlerts());
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const riskCounts = useMemo(() => {
    const counts = { LOW: 0, MODERATE: 0, HIGH: 0 };
    patients.forEach(p => {
      const last = p.visits[p.visits.length - 1];
      if (last) counts[last.riskLevel]++;
      else counts.LOW++;
    });
    return counts;
  }, [patients]);

  const pieData = [
    { name: 'Low Risk', value: riskCounts.LOW, color: 'hsl(134, 61%, 41%)' },
    { name: 'Moderate Risk', value: riskCounts.MODERATE, color: 'hsl(45, 100%, 51%)' },
    { name: 'High Risk', value: riskCounts.HIGH, color: 'hsl(354, 70%, 54%)' },
  ].filter(d => d.value > 0);

  const overdueCounts = useMemo(() => {
    let followup = 0;
    let urgent = 0;
    patients.forEach(p => {
      const status = getOverdueStatus(p);
      if (status === 'followup-overdue') followup++;
      if (status === 'urgent-overdue') urgent++;
    });
    return { followup, urgent, total: followup + urgent };
  }, [patients]);

  const stats = [
    { label: 'Active Pregnancies', value: patients.length, icon: Users, color: 'text-primary', gradient: 'card-gradient-primary' },
    { label: 'High Risk Cases', value: riskCounts.HIGH, icon: AlertTriangle, color: 'text-danger', gradient: 'card-gradient-danger' },
    { label: 'Overdue Visits', value: overdueCounts.total, icon: CalendarClock, color: 'text-warning', gradient: 'card-gradient-warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SyncStatusBar />

      <PageTransition>
        <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <Card
                key={stat.label}
                className={`text-center ${stat.gradient} border-0 shadow-sm card-hover list-item-in`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-4">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <AnimatedCounter value={stat.value} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Risk Distribution Chart */}
          {pieData.length > 0 && (
            <div className="list-item-in" style={{ animationDelay: '250ms' }}>
              <Card className="card-gradient border-0 shadow-sm">
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Risk Distribution</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-32 w-32 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={55}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {pieData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [`${value} patient${value !== 1 ? 's' : ''}`, name]}
                            contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                            <span className="text-sm">{d.name}</span>
                          </div>
                          <span className="text-sm font-bold">{d.value}</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Total</span>
                          <span>{patients.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-3 grid-cols-3 list-item-in" style={{ animationDelay: '350ms' }}>
            <Button
              className="h-12 gradient-primary text-primary-foreground border-0 rounded-xl btn-press"
              onClick={() => navigate('/patients')}
            >
              <Users className="h-4 w-4 mr-2" />
              Patients
            </Button>
            <Button
              variant="secondary"
              className="h-12 rounded-xl btn-press"
              onClick={() => navigate('/patients/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl btn-press"
              onClick={() => navigate('/hospital-portal')}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Portal
            </Button>
          </div>

          {/* FCHV Notifications from Doctors */}
          <FCHVNotifications />

          {/* Recent Alerts */}
          <div className="list-item-in" style={{ animationDelay: '450ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Recent Alerts</h2>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, i) => (
                <Card
                  key={alert.id}
                  className="cursor-pointer card-hover card-gradient border-0 shadow-sm list-item-in"
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                  onClick={() => navigate(`/patients/${alert.patientId}`)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      alert.type === 'escalation' ? 'bg-danger' : 'bg-warning'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.patientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Dashboard;
