import { useState, type ReactNode } from "react";
import { NavbarContext } from "./NavbarContextUtils";

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [isDropdownHovering, setIsDropdownHovering] = useState(false);

  return (
    <NavbarContext.Provider
      value={{ isDropdownHovering, setIsDropdownHovering }}
    >
      {children}
    </NavbarContext.Provider>
  );
}
