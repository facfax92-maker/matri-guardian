import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getReferrals } from '@/lib/storage';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, Phone, Mail, Tag, BarChart3, 
  Pencil, ArrowLeftRight, Settings, LogOut, 
  ChevronDown, X, Users, AlertTriangle, 
  CheckCircle, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_PROFILE = {
  name: 'Radha Thapa',
  initials: 'RT',
  role: 'FCHV',
  area: 'Bhaktapur Ward 5',
  phone: '+977-9841234567',
  email: 'radha.thapa@fchv.gov.np',
};

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stats = useMemo(() => {
    const patients = getPatients();
    const referrals = getReferrals();
    const highRisk = patients.filter(p => {
      const last = p.visits[p.visits.length - 1];
      return last?.riskLevel === 'HIGH';
    }).length;
    const totalVisits = patients.reduce((sum, p) => sum + p.visits.length, 0);
    return {
      totalPatients: patients.length,
      highRisk,
      referrals: referrals.length,
      visits: totalVisits,
      successRate: 95,
      ranking: '#3 of 15 FCHVs',
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-full bg-muted hover:bg-accent transition-colors"
      >
        <Avatar className="h-8 w-8 border-2 border-primary/30">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {DEMO_PROFILE.initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-primary-foreground hidden sm:inline">
          {DEMO_PROFILE.name.split(' ')[0]} T.
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-primary-foreground/80 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-start gap-3">
              <Avatar className="h-14 w-14 border-2 border-white/40 shrink-0">
                <AvatarFallback className="bg-white/30 text-primary-foreground text-lg font-bold">
                  {DEMO_PROFILE.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-primary-foreground font-bold text-base">{DEMO_PROFILE.name}</h3>
                <p className="text-primary-foreground/80 text-sm">{DEMO_PROFILE.role} — {DEMO_PROFILE.area}</p>
                <Badge variant="secondary" className="mt-1.5 bg-white/20 text-primary-foreground border-0 text-[10px]">
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  Demo Account
                </Badge>
              </div>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/60 hover:text-primary-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contact */}
            <div className="px-4 py-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{DEMO_PROFILE.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{DEMO_PROFILE.email}</span>
              </div>
            </div>

            <Separator />

            {/* Stats */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold">My Performance</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Users, label: 'Patients', value: stats.totalPatients },
                  { icon: AlertTriangle, label: 'High Risk', value: stats.highRisk },
                  { icon: CheckCircle, label: 'Referrals', value: stats.referrals },
                  { icon: ClipboardList, label: 'Visits', value: stats.visits },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                    <s.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
                <span>Success Rate: <strong className="text-foreground">{stats.successRate}%</strong></span>
                <span>Ranking: <strong className="text-foreground">{stats.ranking}</strong></span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="p-2 space-y-0.5">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
                onClick={() => { setOpen(false); navigate('/edit-profile'); }}
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
                onClick={() => { setOpen(false); navigate('/switch-account'); }}
              >
                <ArrowLeftRight className="h-4 w-4" /> Switch Account
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
                onClick={() => { setOpen(false); navigate('/settings'); }}
              >
                <Settings className="h-4 w-4" /> Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm text-muted-foreground cursor-not-allowed opacity-50"
                disabled
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
