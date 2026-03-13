import "./App.css";
import "./index.css";
import { Navigate } from "react-router-dom";
import React from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { isLoggedIn, isInitializing } = React.useContext(AuthContext);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <Navigate to="/app/releases" />
      ) : (
        <Navigate to="/app/login" />
      )}
    </>
  );
}

export default App;
