import { useState, useEffect } from 'react';
import matricareLogo from '@/assets/matricare-logo.png';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 1200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return visible ? (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, willChange: 'opacity' }}
    >
      <img src={matricareLogo} alt="MatriCare" className="w-24 h-24 object-contain" />
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
        Matri<span className="text-primary">Care</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Maternal Risk Intelligence System
      </p>
    </div>
  ) : null;
}
