import { Label } from "@radix-ui/react-dropdown-menu";
// import { AuthContext } from "../../context/AuthContext";
// import React, { useEffect, useState } from "react";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { NavMenu } from "./NavMenu";
import AccountMenu from "./AccountMenu";

const Navbar = () => {
  // const { userId } = React.useContext(AuthContext);
  const { settings } = useSettings();
  // const [username, setUsername] = useState("");

  // useEffect(() => {
  //   const fetchUsername = async () => {
  //     if (!userId) return;

  //     try {
  //       const response = await fetch(
  //         `http://localhost:8080/api/users/${userId}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         },
  //       );

  //       if (!response.ok) {
  //         console.error("Failed to fetch username");
  //         return;
  //       }

  //       const data = await response.json();
  //       setUsername(data.email);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchUsername();
  // });
  return (
    <nav
      className={`absolute top-0 left-0 right-0 flex justify-between items-center p-4 max-w-full w-full border-b-2 ${
        settings.useLiquidGlass
          ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
          : "bg-linear-to-b from-gray-700 to-gray-500 [border-image:linear-gradient(to_right,var(--color-green-400),var(--color-green-600))_1]"
      }`}
    >
      <div className="navbar-left"></div>
      <div className="navbar-center">
        <NavMenu useLiquidGlass={settings.useLiquidGlass} />
      </div>
      <div className="flex items-center gap-4">
        <Label
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
        >
          Logged in as {/*{username} */}
        </Label>
        <AccountMenu />
      </div>
    </nav>
  );
};

export default Navbar;
