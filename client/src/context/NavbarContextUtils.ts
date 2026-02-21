import { createContext, useContext } from "react";

interface NavbarContextType {
  isDropdownHovering: boolean;
  setIsDropdownHovering: (value: boolean) => void;
}

export const NavbarContext = createContext<NavbarContextType | undefined>(
  undefined,
);

export function useNavbarContext() {
  const context = useContext(NavbarContext);
  if (!context) {
    return {
      isDropdownHovering: false,
      setIsDropdownHovering: () => {},
    };
  }
  return context;
}
