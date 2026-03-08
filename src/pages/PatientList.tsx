import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, initStorage } from '@/lib/storage';
import { Patient } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Search } from 'lucide-react';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    initStorage();
    setPatients(getPatients());
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">All Patients</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(patient => {
            const lastVisit = patient.visits[patient.visits.length - 1];
            return (
              <Card
                key={patient.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.age}y | {patient.gestationalAge} weeks
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{patient.village}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {lastVisit && <RiskBadge level={lastVisit.riskLevel} size="sm" />}
                      <span className="text-xs text-muted-foreground">
                        {patient.visits.length} visit{patient.visits.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary text-primary-foreground border-0"
        onClick={() => navigate('/patients/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PatientList;
