import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Stethoscope, Moon, Sun, CloudOff } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/lib/i18n';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import matricareLogo from '@/assets/matricare-logo.png';
import { useState, useEffect } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: Home },
    { path: '/patients', label: t('nav.patients'), icon: Users },
    { path: '/hospital-portal', label: t('nav.portal'), icon: Stethoscope },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150"
        >
          <img src={matricareLogo} alt="MatriCare logo" className="h-10 w-auto dark-logo-adapt" />
          <span className="text-lg font-bold text-primary tracking-tight hidden sm:inline">
            {t('app.name')}
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full gap-1.5 text-xs sm:text-sm"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Offline Status Indicator */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning/15 border border-warning/30">
              <CloudOff className="h-3.5 w-3.5 text-warning" />
              <span className="text-[10px] font-semibold text-warning hidden sm:inline">{t('offline.localMode')}</span>
              <Badge variant="secondary" className="h-4 text-[9px] px-1.5 py-0">{t('offline.pendingSync')}: 4</Badge>
            </div>
          )}
          <button
            onClick={toggle}
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors duration-150"
          >
            {isDark ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
