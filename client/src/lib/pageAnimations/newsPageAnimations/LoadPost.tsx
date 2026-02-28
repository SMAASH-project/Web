import { motion } from "motion/react";
import type { ReactNode } from "react";

interface LoadPostProps {
  children: ReactNode;
  index: number;
}

export function LoadPost({ children, index }: LoadPostProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}
