import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 0.8, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const prevValue = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const start = prevValue.current;
    const end = value;
    prevValue.current = value;
    if (start === end) { setDisplay(end); return; }

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) { setDisplay(end); return; }
      const eased = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, inView, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {display}
    </motion.span>
  );
}
