import * as motion from "motion/react-client";
import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export function CardAnimation({ children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 1.5, bounce: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default CardAnimation;
