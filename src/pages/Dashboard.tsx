import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getAlerts, initStorage } from '@/lib/storage';
import { Patient, Alert } from '@/lib/types';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, CalendarCheck, Plus, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    initStorage();
    setPatients(getPatients());
    setAlerts(getAlerts());
  }, []);

  const highRiskCount = patients.filter(p => {
    const lastVisit = p.visits[p.visits.length - 1];
    return lastVisit?.riskLevel === 'HIGH';
  }).length;

  const stats = [
    { label: 'Active Pregnancies', value: patients.length, icon: Users, color: 'text-primary' },
    { label: 'High Risk Cases', value: highRiskCount, icon: AlertTriangle, color: 'text-danger' },
    { label: 'Follow-ups Due', value: 7, icon: CalendarCheck, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />

      {/* Header */}
      <header className="gradient-primary px-4 py-6 text-primary-foreground">
        <div className="container max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-6 w-6" />
            <h1 className="text-xl font-bold tracking-tight">MatriCare</h1>
          </div>
          <p className="text-sm opacity-90">FCHV Dashboard</p>
          <p className="text-lg font-semibold mt-2">Welcome, Radha Thapa</p>
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
              <Card className="text-center">
                <CardContent className="p-4">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 gradient-primary text-primary-foreground border-0"
            onClick={() => navigate('/patients')}
          >
            <Users className="h-4 w-4 mr-2" />
            View All Patients
          </Button>
          <Button
            variant="secondary"
            className="h-12"
            onClick={() => navigate('/patients/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Register New
          </Button>
        </div>

        {/* Recent Alerts */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/patients/${alert.patientId}`)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
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
