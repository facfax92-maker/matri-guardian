import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getAlerts, initStorage } from '@/lib/storage';
import { Patient, Alert, RiskLevel } from '@/lib/types';
import { SyncStatusBar, SyncStatusIndicator } from '@/components/SyncStatus';
import { RiskBadge } from '@/components/RiskBadge';
import { migrateFromLocalStorage } from '@/lib/indexed-db';
import { getOverdueStatus } from '@/lib/visit-utils';
import { FCHVNotifications } from '@/components/FCHVNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Plus, ChevronRight, Activity, PieChart, Bell, Clock, Moon, Sun, CalendarClock, LogOut, Stethoscope } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { ProfileMenu } from '@/components/ProfileMenu';

const Dashboard = () => {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    initStorage();
    migrateFromLocalStorage().catch(() => {});
    setPatients(getPatients());
    setAlerts(getAlerts());
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
      <SyncStatusBar />

      {/* Header */}
      <header className="gradient-primary px-4 py-6 text-primary-foreground" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        <div className="container max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <h1 className="text-xl font-bold tracking-tight">MatriCare</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
              <button onClick={signOut} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm opacity-90">{roles[0]?.toUpperCase() || 'FCHV'} Dashboard</p>
            {roles.map(r => (
              <Badge key={r} variant="secondary" className="bg-white/20 text-primary-foreground border-0 text-xs">
                {r.toUpperCase()}
              </Badge>
            ))}
          </div>
          <p className="text-lg font-semibold mt-2">
            Welcome, {profile?.full_name || 'User'}
          </p>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`text-center ${stat.gradient} border-0 shadow-sm`}>
                <CardContent className="p-4">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Risk Distribution Chart */}
        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className={`grid gap-3 ${roles.includes('doctor') || roles.includes('admin') ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <Button
            className="h-12 gradient-primary text-primary-foreground border-0 rounded-xl"
            onClick={() => navigate('/patients')}
          >
            <Users className="h-4 w-4 mr-2" />
            Patients
          </Button>
          <Button
            variant="secondary"
            className="h-12 rounded-xl"
            onClick={() => navigate('/patients/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Register
          </Button>
          {(roles.includes('doctor') || roles.includes('admin')) && (
            <Button
              variant="outline"
              className="h-12 rounded-xl"
              onClick={() => navigate('/hospital-portal')}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Portal
            </Button>
          )}
        </div>

        {/* FCHV Notifications from Doctors */}
        {roles.includes('fchv') && <FCHVNotifications />}

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all card-gradient border-0 shadow-sm"
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
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
