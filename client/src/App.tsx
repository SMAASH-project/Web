import './App.css'
import './index.css'
import Navbar from './components/navbar.tsx'
import { Navigate } from 'react-router-dom';


function App() {
  const IsLoggedIn = false; // Replace with actual authentication logic
  return (
    <>
      {IsLoggedIn ? (
        <>
          <Navbar />
        </>
      ) : (
        <Navigate to="/app/login" />
      )}
    </>
  )
}

export default App
