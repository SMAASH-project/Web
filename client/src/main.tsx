import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="bg-linear-to-r from-gray-700 via-black to-gray-700 text-white w-screen h-screen absolute top-0 left-0 flex items-center justify-center">
    <App />
    </div>    
  </StrictMode>,
)
