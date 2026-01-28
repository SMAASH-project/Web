import './App.css'
import './index.css'
import { Outlet } from 'react-router-dom';
import React from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
  const { isLoggedIn } = React.useContext(AuthContext);
  
  if (isLoggedIn === undefined) {
    return <div>Loading...</div>;
  }
  
  return <Outlet />;
}

export default App
