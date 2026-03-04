import { useState, type ReactNode } from "react";
import { NavbarContext } from "./NavbarContextUtils";

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [isDropdownHovering, setIsDropdownHovering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <NavbarContext.Provider
      value={{
        isDropdownHovering,
        setIsDropdownHovering,
        isDropdownOpen,
        setIsDropdownOpen,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}
