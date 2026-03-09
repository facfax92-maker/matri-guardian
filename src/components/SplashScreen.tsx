import { useState, useEffect } from 'react';
import { Heart, Activity } from 'lucide-react';
import matricareLogo from '@/assets/matricare-logo.png';

const APP_NAME = 'MatriCare';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    // After logo + text animate in, hold briefly then exit
    const showTimer = setTimeout(() => setPhase('show'), 100);
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    const doneTimer = setTimeout(onComplete, 2700);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background ${
        phase === 'exit' ? 'splash-fade-out' : ''
      }`}
      style={{ willChange: 'opacity' }}
      onClick={() => {
        setPhase('exit');
        setTimeout(onComplete, 500);
      }}
    >
      {/* Logo icon */}
      <div className="splash-logo-wrapper relative mb-6">
        <div className="splash-logo-icon w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Heart className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
          <Activity className="h-5 w-5 text-primary-foreground absolute bottom-2 right-2 opacity-80" />
        </div>
      </div>

      {/* App name — staggered letters */}
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2" aria-label={APP_NAME}>
        {APP_NAME.split('').map((char, i) => (
          <span
            key={i}
            className={`splash-letter ${i >= 5 ? 'text-primary' : ''}`}
            style={{ animationDelay: `${0.5 + i * 0.06}s` }}
          >
            {char}
          </span>
        ))}
      </h1>

      {/* Subtitle */}
      <p className="splash-subtitle text-sm text-muted-foreground tracking-wide">
        Maternal Risk Intelligence System
      </p>

      {/* Loading bar */}
      <div className="mt-8 w-32 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full gradient-primary splash-bar" />
      </div>
    </div>
  );
}
