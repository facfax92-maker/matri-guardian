import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Stethoscope, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Button } from '@/components/ui/button';
import matricareLogo from '@/assets/matricare-logo.png';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/hospital-portal', label: 'Portal', icon: Stethoscope },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150"
        >
          <img src={matricareLogo} alt="MatriCare logo" className="h-10 w-auto dark-logo-adapt" />
          <span className="text-lg font-bold text-primary tracking-tight hidden sm:inline">
            MatriCare
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
