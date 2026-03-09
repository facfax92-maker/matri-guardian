import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import matricareLogo from '@/assets/matricare-logo.png';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 1500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ willChange: 'opacity' }}
        >
          <motion.img
            src={matricareLogo}
            alt="MatriCare"
            className="w-24 h-24 object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ willChange: 'opacity' }}
          />

          <motion.h1
            className="mt-5 text-3xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          >
            Matri<span className="text-primary">Care</span>
          </motion.h1>

          <motion.p
            className="mt-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
          >
            Maternal Risk Intelligence System
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
