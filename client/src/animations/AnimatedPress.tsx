import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useSettings } from "@/pages/settings/SettingsContext";

interface AnimatedPressProps {
  children: ReactNode;
  scale?: number;
  tapScale?: number;
  className?: string;
}

export function AnimatedPress({
  children,
  scale = 1.05,
  tapScale = 0.95,
  className,
}: AnimatedPressProps) {
  const { settings } = useSettings();
  if (settings.useAnimations) {
    return (
      <motion.div whileHover={{ scale }} whileTap={{ scale: tapScale }} className={className}>
        {children}
      </motion.div>
    );
  }
  return <div className={className}>{children}</div>;
}
