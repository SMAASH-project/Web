import { type ReactNode, useState } from "react";
import { ColorContext } from "@/context/ColorContext";

export function ColorProvider({ children }: { children: ReactNode }) {
  const [colorLeft, setColorLeft] = useState("#0f0f0f");
  const [colorMiddle, setColorMiddle] = useState("#0f0f0f");
  const [colorRight, setColorRight] = useState("#0f0f0f");

  return (
    <ColorContext.Provider
      value={{
        colorLeft,
        colorMiddle,
        colorRight,
        setColorLeft,
        setColorMiddle,
        setColorRight,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}
