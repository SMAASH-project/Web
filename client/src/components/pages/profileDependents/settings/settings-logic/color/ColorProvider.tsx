import { type ReactNode, useState } from "react";
import { ColorContext } from "./ColorContext";

export function ColorProvider({ children }: { children: ReactNode }) {
  const [colorLeft, setColorLeft] = useState("#616161");
  const [colorMiddle, setColorMiddle] = useState("#000000");
  const [colorRight, setColorRight] = useState("#616161");

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
