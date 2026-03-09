import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import matricareLogo from '@/assets/matricare-logo.png';

const appName = 'MatriCare';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'exit' | 'done'>('intro');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 2200);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Animated radial rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/10"
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{
                width: [0, 300 + i * 150],
                height: [0, 300 + i * 150],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                delay: 0.3 + i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Soft glow behind logo */}
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-primary/15 blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 1.4], opacity: [0, 0.8, 0.5] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Heartbeat line */}
          <motion.svg
            viewBox="0 0 200 40"
            className="absolute w-64 h-10 z-[5]"
            style={{ top: '50%', marginTop: '50px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ delay: 0.8, duration: 1.5 }}
          >
            <motion.path
              d="M0,20 L50,20 L60,5 L70,35 L80,10 L90,25 L100,20 L200,20"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: 'easeInOut' }}
            />
          </motion.svg>

          {/* Logo with pop-in + heartbeat */}
          <motion.div className="relative z-10">
            <motion.img
              src={matricareLogo}
              alt="MatriCare"
              className="w-28 h-28 object-contain drop-shadow-xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.15, 0.95, 1.05, 1],
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                times: [0, 0.4, 0.6, 0.8, 1],
              }}
            />
            {/* Heartbeat pulse overlay */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1.3, 1, 1.3, 1],
                opacity: [0, 0.4, 0, 0.3, 0],
              }}
              transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Letter-by-letter app name */}
          <div className="relative z-10 mt-6 flex items-baseline">
            {appName.split('').map((char, i) => (
              <motion.span
                key={i}
                className={`text-4xl font-bold tracking-tight ${
                  i >= 5 ? 'text-primary' : 'text-foreground'
                }`}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.6 + i * 0.07,
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            className="relative z-10 mt-3 text-sm font-medium tracking-wide text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5, ease: 'easeOut' }}
          >
            Maternal Risk Intelligence System
          </motion.p>

          {/* Loading bar */}
          <motion.div
            className="relative z-10 mt-8 w-32 h-1 rounded-full bg-muted overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.5, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
