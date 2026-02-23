import { useContext } from "react";
import { ColorContext } from "./components/pages/profile-dependents/settings/settings-logic/color/ColorContext";

interface WrapperProps {
  children: React.ReactNode;
}

export function Wrapper({ children }: WrapperProps) {
  const context = useContext(ColorContext);
  const colorLeft = context?.colorLeft || "#616161";
  const colorMiddle = context?.colorMiddle || "#000000";
  const colorRight = context?.colorRight || "#616161";

  return (
    <div
      className="text-white w-screen h-screen absolute top-0 left-0 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(to right, ${colorLeft}, ${colorMiddle}, ${colorRight})`,
      }}
    >
      {children}
    </div>
    // <div className=" bg-linear-to-r from-gray-700 via-black to-gray-700 text-white w-screen h-screen absolute top-0 left-0 flex items-center justify-center">
    //   {children}
    // </div>
  );
}
