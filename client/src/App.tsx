import './App.css'
import './index.css'
import Navbar from './components/navbar.tsx'
import { Navigate } from 'react-router-dom';


function App() {
    const IsLoggedIn = true; // Replace with actual authentication logic
    return (
        <>
            {IsLoggedIn ? (
                <>
                   <Navbar/>
                </>
            ) : (
                <Navigate to="/login" />
            )}
        </>
    )
}

export default App
