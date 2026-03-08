import { useState } from 'react';
import { Visit } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareVisitsProps {
  visits: Visit[];
}

function DiffIndicator({ current, previous, unit = '', higherIsWorse = true }: {
  current: number; previous: number; unit?: string; higherIsWorse?: boolean;
}) {
  const diff = current - previous;
  if (diff === 0) return <span className="text-xs text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" />No change</span>;
  const isWorse = higherIsWorse ? diff > 0 : diff < 0;
  return (
    <span className={cn('text-xs flex items-center gap-1 font-medium', isWorse ? 'text-danger' : 'text-success')}>
      {isWorse ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {diff > 0 ? '+' : ''}{diff}{unit}
    </span>
  );
}

export function CompareVisits({ visits }: CompareVisitsProps) {
  const [visitA, setVisitA] = useState<string>(visits.length >= 2 ? visits[visits.length - 2].id : visits[0]?.id || '');
  const [visitB, setVisitB] = useState<string>(visits[visits.length - 1]?.id || '');

  const a = visits.find(v => v.id === visitA);
  const b = visits.find(v => v.id === visitB);

  if (visits.length < 2) return null;

  const protOrder = ['Negative', 'Trace', '1+', '2+', '3+'];
  const edemaOrder = ['None', 'Mild (feet only)', 'Moderate (legs)', 'Severe (face and hands)'];
  const headacheOrder = ['None', 'Mild', 'Moderate', 'Severe/persistent'];

  const comparisons = a && b ? [
    { label: 'Visit Date', a: a.date, b: b.date },
    { label: 'GA (weeks)', a: `${a.gestationalAge}`, b: `${b.gestationalAge}` },
    { label: 'Risk Score', a: `${a.riskScore}`, b: `${b.riskScore}`, diff: true, aVal: a.riskScore, bVal: b.riskScore },
    { label: 'BP Systolic', a: `${a.systolic}`, b: `${b.systolic}`, diff: true, aVal: a.systolic, bVal: b.systolic, unit: ' mmHg' },
    { label: 'BP Diastolic', a: `${a.diastolic}`, b: `${b.diastolic}`, diff: true, aVal: a.diastolic, bVal: b.diastolic, unit: ' mmHg' },
    { label: 'Weight', a: `${a.weight} kg`, b: `${b.weight} kg`, diff: true, aVal: a.weight, bVal: b.weight, unit: ' kg' },
    { label: 'Proteinuria', a: a.proteinuria, b: b.proteinuria, worse: protOrder.indexOf(b.proteinuria) > protOrder.indexOf(a.proteinuria) },
    { label: 'Edema', a: a.edema.split(' ')[0], b: b.edema.split(' ')[0], worse: edemaOrder.indexOf(b.edema) > edemaOrder.indexOf(a.edema) },
    { label: 'Headache', a: a.headache, b: b.headache, worse: headacheOrder.indexOf(b.headache) > headacheOrder.indexOf(a.headache) },
    { label: 'Visual Dist.', a: a.visualDisturbances ? 'Yes' : 'No', b: b.visualDisturbances ? 'Yes' : 'No', worse: !a.visualDisturbances && b.visualDisturbances },
    { label: 'Epigastric Pain', a: a.epigastricPain ? 'Yes' : 'No', b: b.epigastricPain ? 'Yes' : 'No', worse: !a.epigastricPain && b.epigastricPain },
    { label: 'Fetal Movement', a: a.fetalMovement, b: b.fetalMovement },
  ] : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 w-full">
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Compare Visits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Visits</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Visit A</label>
            <Select value={visitA} onValueChange={setVisitA}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {visits.map(v => (
                  <SelectItem key={v.id} value={v.id}>Visit {v.visitNumber} ({v.date.slice(5)})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Visit B</label>
            <Select value={visitB} onValueChange={setVisitB}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {visits.map(v => (
                  <SelectItem key={v.id} value={v.id}>Visit {v.visitNumber} ({v.date.slice(5)})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {a && b && (
          <>
            {/* Risk Level comparison */}
            <div className="flex items-center justify-around py-3 bg-muted rounded-lg mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Visit {a.visitNumber}</p>
                <RiskBadge level={a.riskLevel} score={a.riskScore} size="md" animate={false} />
              </div>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Visit {b.visitNumber}</p>
                <RiskBadge level={b.riskLevel} score={b.riskScore} size="md" animate={false} />
              </div>
            </div>

            {/* Detail table */}
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {comparisons.map((row, i) => (
                <div key={row.label} className={cn(
                  'grid grid-cols-[1fr_1fr_1fr] text-sm py-2 px-3',
                  i % 2 === 0 ? 'bg-background' : 'bg-muted/50',
                  'worse' in row && row.worse && 'bg-danger-bg/50',
                )}>
                  <span className="text-muted-foreground font-medium text-xs">{row.label}</span>
                  <span className="text-center">{row.a}</span>
                  <span className="text-center flex flex-col items-center">
                    <span>{row.b}</span>
                    {'diff' in row && row.diff && row.aVal !== undefined && row.bVal !== undefined && (
                      <DiffIndicator current={row.bVal} previous={row.aVal} unit={row.unit} />
                    )}
                    {'worse' in row && row.worse && (
                      <span className="text-xs text-danger font-medium flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> Worse
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
