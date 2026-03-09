import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Home, Users, Stethoscope } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
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
        {/* Left: Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={matricareLogo} alt="MatriCare logo" className="h-10 w-auto" />
          <span className="text-lg font-bold text-primary tracking-tight hidden sm:inline">
            MatriCare
          </span>
        </button>

        {/* Center: Nav links */}
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

        {/* Right: Theme toggle + Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
              </motion.div>
            </AnimatePresence>
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
