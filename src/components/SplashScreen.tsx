import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import matricareLogo from '@/assets/matricare-logo.png';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'expand' | 'done'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('expand'), 1800);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Soft radial glow */}
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Logo */}
          <motion.img
            src={matricareLogo}
            alt="MatriCare"
            className="relative z-10 w-24 h-24 object-contain drop-shadow-lg"
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          />

          {/* App name */}
          <motion.h1
            className="relative z-10 mt-5 text-3xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Matri<span className="text-primary">Care</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="relative z-10 mt-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            Maternal Health. Community Care.
          </motion.p>

          {/* Loading dots */}
          <div className="relative z-10 flex gap-1.5 mt-8">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                initial={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
