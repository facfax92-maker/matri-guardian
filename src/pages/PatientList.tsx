import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, initStorage } from '@/lib/storage';
import { Patient, RiskLevel } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { getOverdueStatus, getDaysSinceLastVisit } from '@/lib/visit-utils';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Filter, ArrowUpDown, Clock, Users, AlertTriangle } from 'lucide-react';

type SortOption = 'name' | 'ga-desc' | 'ga-asc' | 'last-visit';
type FilterOption = 'ALL' | RiskLevel | 'OVERDUE';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<FilterOption>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  useEffect(() => {
    initStorage();
    setPatients(getPatients());
  }, []);

  const processed = useMemo(() => {
    let result = patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase())
    );

    if (riskFilter === 'OVERDUE') {
      result = result.filter(p => getOverdueStatus(p) !== 'none');
    } else if (riskFilter !== 'ALL') {
      result = result.filter(p => {
        const last = p.visits[p.visits.length - 1];
        return last?.riskLevel === riskFilter;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'ga-desc': return b.gestationalAge - a.gestationalAge;
        case 'ga-asc': return a.gestationalAge - b.gestationalAge;
        case 'last-visit': {
          const aDate = a.visits.length ? new Date(a.visits[a.visits.length - 1].date).getTime() : 0;
          const bDate = b.visits.length ? new Date(b.visits[b.visits.length - 1].date).getTime() : 0;
          return bDate - aDate;
        }
        default: return 0;
      }
    });

    return result;
  }, [patients, search, riskFilter, sortBy]);

  const riskCounts = useMemo(() => {
    const counts = { ALL: patients.length, LOW: 0, MODERATE: 0, HIGH: 0, OVERDUE: 0 };
    patients.forEach(p => {
      const last = p.visits[p.visits.length - 1];
      if (last) counts[last.riskLevel]++;
      else counts.LOW++;
      if (getOverdueStatus(p) !== 'none') counts.OVERDUE++;
    });
    return counts;
  }, [patients]);

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">All Patients</h1>
            <p className="text-sm opacity-80">{patients.length} registered</p>
          </div>
          <Users className="h-5 w-5 opacity-80" />
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Risk Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto">
            {(['ALL', 'LOW', 'MODERATE', 'HIGH', 'OVERDUE'] as FilterOption[]).map(level => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border-2 ${
                  riskFilter === level
                    ? level === 'ALL' ? 'bg-primary text-primary-foreground border-primary'
                    : level === 'LOW' ? 'bg-success-bg text-success-foreground border-success'
                    : level === 'MODERATE' ? 'bg-warning-bg text-warning-foreground border-warning'
                    : level === 'HIGH' ? 'bg-danger-bg text-danger-foreground border-danger'
                    : 'bg-warning-bg text-warning-foreground border-warning'
                    : 'bg-muted text-muted-foreground border-transparent'
                }`}
              >
                {level === 'ALL' ? 'All' : level === 'OVERDUE' ? '⏰ Overdue' : level} ({riskCounts[level]})
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="h-8 text-xs rounded-xl w-auto min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="ga-desc">GA (Highest first)</SelectItem>
              <SelectItem value="ga-asc">GA (Lowest first)</SelectItem>
              <SelectItem value="last-visit">Last Visit (Recent)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patient Cards */}
        <div className="space-y-3">
          {processed.map((patient) => {
            const lastVisit = patient.visits[patient.visits.length - 1];
            const overdueStatus = getOverdueStatus(patient);
            const daysSince = getDaysSinceLastVisit(patient);
            return (
              <Card
                key={patient.id}
                className={`cursor-pointer hover:bg-accent/50 transition-colors duration-150 card-gradient border-0 shadow-sm ${
                  overdueStatus === 'urgent-overdue' ? 'ring-2 ring-danger/50' : ''
                }`}
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{patient.name}</h3>
                        {overdueStatus === 'urgent-overdue' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-bg text-danger-foreground text-[10px] font-bold border border-danger">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            URGENT: High Risk + Overdue
                          </span>
                        )}
                        {overdueStatus === 'followup-overdue' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-bg text-warning-foreground text-[10px] font-semibold border border-warning">
                            <Clock className="h-2.5 w-2.5" />
                            Follow-up Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {patient.age}y · {patient.gestationalAge} weeks GA
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{patient.village}</p>
                      {lastVisit && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last visit: {lastVisit.date}
                          {overdueStatus !== 'none' && (
                            <span className="font-medium text-warning-foreground"> ({daysSince}d ago)</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                      {lastVisit && <RiskBadge level={lastVisit.riskLevel} size="md" showIcon animate={false} />}
                      <span className="text-xs text-muted-foreground">
                        {patient.visits.length} visit{patient.visits.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {processed.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No patients found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
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
