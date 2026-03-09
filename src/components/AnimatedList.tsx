import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedListItem({ children, index, className }: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -12, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        delay: 0.08 + index * 0.05,
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AnimatedEmptyState({ icon, title, description, action }: AnimatedEmptyStateProps) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-3"
      >
        {icon}
      </motion.div>
      <motion.p
        className="font-medium"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.p>
      {description && (
        <motion.p
          className="text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
