import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import matricareLogo from '@/assets/matricare-logo.png';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

  useEffect(() => {
    const textTimer = setTimeout(() => setPhase('text'), 1200);
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    const doneTimer = setTimeout(onComplete, 2700);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#FFFFFF' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Logo with scale-up and clip-path reveal */}
          <motion.div
            className="relative"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.img
              src={matricareLogo}
              alt="MatriCare Logo"
              className="w-72 sm:w-96 h-auto"
              style={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            />
          </motion.div>

          {/* Text fade-in */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={phase === 'text' ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span style={{ color: '#1a3a4a' }}>MATRI</span>
              <span style={{ color: '#2a9d8f' }}>CARE</span>
            </h1>
            <p className="mt-1 text-sm tracking-widest" style={{ color: '#2a9d8f' }}>
              Predicting Risk. Protecting Life.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
