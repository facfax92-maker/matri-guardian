import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface RiskTrajectoryChartProps {
  currentScore: number;
  visitNumber: number;
}

export function RiskTrajectoryChart({ currentScore, visitNumber }: RiskTrajectoryChartProps) {
  const [showProjection, setShowProjection] = useState(false);
  const { t } = useI18n();

  // Generate projection data: 4 future points
  const data = Array.from({ length: 5 }, (_, i) => {
    const week = visitNumber + i;
    const untreated = Math.min(100, currentScore + i * (currentScore > 60 ? 6 : 4));
    const treated = Math.max(10, currentScore - i * (currentScore > 60 ? 10 : 6));
    return {
      name: i === 0 ? `V${visitNumber} (Now)` : `+${i * 2}wk`,
      untreated: i === 0 ? currentScore : untreated,
      treated: i === 0 ? currentScore : treated,
    };
  });

  return (
    <Card className="card-gradient border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{t('projection.title')}</CardTitle>
          </div>
          <Button
            variant={showProjection ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-7 rounded-full"
            onClick={() => setShowProjection(!showProjection)}
          >
            {showProjection ? t('projection.hide') : t('projection.show')}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {showProjection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <CardContent className="px-2 pb-4 pt-0">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-20" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={70} stroke="hsl(354, 70%, 54%)" strokeDasharray="6 3" strokeWidth={1} />
                    <ReferenceLine y={40} stroke="hsl(45, 100%, 51%)" strokeDasharray="6 3" strokeWidth={1} />
                    <Line
                      type="monotone"
                      dataKey="untreated"
                      stroke="hsl(354, 70%, 54%)"
                      strokeWidth={2.5}
                      strokeDasharray="8 4"
                      dot={{ r: 3, fill: 'hsl(354, 70%, 54%)' }}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                    <Line
                      type="monotone"
                      dataKey="treated"
                      stroke="hsl(134, 61%, 41%)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: 'hsl(134, 61%, 41%)' }}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                    <Legend
                      formatter={(value: string) =>
                        value === 'untreated' ? t('projection.untreated') : t('projection.treated')
                      }
                      iconType="line"
                      wrapperStyle={{ fontSize: '10px' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
