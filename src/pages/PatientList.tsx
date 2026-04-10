import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPatients, initStorage } from '@/lib/storage';
import { Patient, RiskLevel } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskSparkline } from '@/components/RiskSparkline';
import { getOverdueStatus, getDaysSinceLastVisit } from '@/lib/visit-utils';
import { Navbar } from '@/components/Navbar';
import { PageTransition } from '@/components/PageTransition';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Filter, ArrowUpDown, Clock, Users, AlertTriangle } from 'lucide-react';
import { PatientListSkeleton } from '@/components/PatientListSkeleton';
import { useI18n } from '@/lib/i18n';

type SortOption = 'name' | 'ga-desc' | 'ga-asc' | 'last-visit';
type FilterOption = 'ALL' | RiskLevel | 'OVERDUE';

const PatientList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, tName, language } = useI18n();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const initialFilter = (searchParams.get('filter') as FilterOption) || 'ALL';
  const [riskFilter, setRiskFilter] = useState<FilterOption>(initialFilter);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initStorage();
    const timer = setTimeout(() => {
      setPatients(getPatients());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
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

  const filterLabels: Record<FilterOption, string> = {
    ALL: t('common.all'),
    LOW: t('risk.low'),
    MODERATE: t('risk.moderate'),
    HIGH: t('risk.high'),
    OVERDUE: `⏰ ${t('overdue')}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="container max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">{t('patients.all')}</h1>
            <span className="text-sm text-muted-foreground">({patients.length})</span>
          </div>
        </div>

        <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Search */}
          <div className="relative input-focus-glow rounded-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('patients.search')}
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border-2 btn-press ${
                    riskFilter === level
                      ? level === 'ALL' ? 'bg-primary text-primary-foreground border-primary'
                      : level === 'LOW' ? 'bg-success-bg text-success-foreground border-success'
                      : level === 'MODERATE' ? 'bg-warning-bg text-warning-foreground border-warning'
                      : level === 'HIGH' ? 'bg-danger-bg text-danger-foreground border-danger'
                      : 'bg-warning-bg text-warning-foreground border-warning'
                      : 'bg-muted text-muted-foreground border-transparent'
                  }`}
                >
                  {filterLabels[level]} ({riskCounts[level]})
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
                <SelectItem value="name">{t('common.sortName')}</SelectItem>
                <SelectItem value="ga-desc">{t('common.sortGAHigh')}</SelectItem>
                <SelectItem value="ga-asc">{t('common.sortGALow')}</SelectItem>
                <SelectItem value="last-visit">{t('common.sortLastVisit')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient Cards */}
          {isLoading ? <PatientListSkeleton /> : <div className="space-y-3">
            {processed.map((patient, i) => {
              const lastVisit = patient.visits[patient.visits.length - 1];
              const overdueStatus = getOverdueStatus(patient);
              const daysSince = getDaysSinceLastVisit(patient);
              return (
                <Card
                  key={patient.id}
                  className={`cursor-pointer card-hover card-gradient border-0 shadow-sm list-item-in ${
                    overdueStatus === 'urgent-overdue' ? 'ring-2 ring-danger/50' : ''
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{tName(patient.name)}</h3>
                          {overdueStatus === 'urgent-overdue' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-bg text-danger-foreground text-[10px] font-bold border border-danger pulse-red">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              {t('overdue.urgentHighRisk')}
                            </span>
                          )}
                          {overdueStatus === 'followup-overdue' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-bg text-warning-foreground text-[10px] font-semibold border border-warning">
                              <Clock className="h-2.5 w-2.5" />
                              <span className="pulse-yellow">{t('overdue.followup')}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {language === 'ne' 
                            ? `${t('patient.age')}: ${patient.age} ${t('patient.years')} | ${t('patient.pregnancy')}: ${patient.gestationalAge} ${t('patient.weeks')} | ${t('patient.address')}: ${patient.village}`
                            : `${patient.age}y · ${patient.gestationalAge} ${t('common.weeksGA')}`
                          }
                        </p>
                        {language === 'ne' && lastVisit && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('patients.lastVisit')}: {lastVisit.date}
                            {overdueStatus !== 'none' && (
                              <span className="font-medium text-warning-foreground"> ({daysSince} {t('patient.daysAgo')})</span>
                            )}
                          </p>
                        )}
                        {language === 'en' && (
                          <>
                            <p className="text-xs text-muted-foreground mt-1">{patient.village}</p>
                            {lastVisit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('patients.lastVisit')}: {lastVisit.date}
                                {overdueStatus !== 'none' && (
                                  <span className="font-medium text-warning-foreground"> ({daysSince}{t('common.dAgo')})</span>
                                )}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                        {lastVisit && <RiskBadge level={lastVisit.riskLevel} size="sm" showIcon />}
                        <RiskSparkline visits={patient.visits} />
                        {patient.visits.length >= 2 && getDaysSinceLastVisit(patient) > 28 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-warning-bg text-warning-foreground text-[10px] font-bold border border-warning">
                            <span className="pulse-yellow">{t('overdue')} {getDaysSinceLastVisit(patient)}d</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {processed.length === 0 && (
              <EmptyState
                illustration="patients"
                title={t('patients.noFound')}
                description={search || riskFilter !== 'ALL' ? t('patients.noFound') : t('patients.registerFirst')}
                actionLabel={!search && riskFilter === 'ALL' ? t('patients.registerPatient') : undefined}
                onAction={!search && riskFilter === 'ALL' ? () => navigate('/patients/new') : undefined}
              />
            )}
          </div>}
        </main>

        {/* FAB */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary text-primary-foreground border-0 fab-pulse btn-press"
          onClick={() => navigate('/patients/new')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </PageTransition>
    </div>
  );
};

export default PatientList;
