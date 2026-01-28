import './App.css'
import './index.css'
import { Navigate, Outlet } from 'react-router-dom';
import React from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
  const { isLoggedIn } = React.useContext(AuthContext);
  
  if (isLoggedIn === undefined) {
    return <div>Loading...</div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="app/login" />;
  }
  
  return <Outlet />;
}

export default App
