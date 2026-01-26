import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginForm } from './components/login-form.tsx';
import { SignupForm } from './components/signup-form.tsx';
import { PasswordResetForm } from './components/passwordreset-form.tsx';

const router = createBrowserRouter([
  { path: "/app", element: <App /> },
  { path: "/app/login", element: <LoginForm className="w-100" /> },
  { path: "/app/signup", element: <SignupForm className="w-100" /> },
  { path: "/app/reset-password", element: <PasswordResetForm className="w-100" /> },
  // {path: "/about", element: <AboutPage />},
  // {path: "/gallery", element: <GalleryPage />},
  // {path: "/releases", element: <ReleasesPage />},
  // {path: "/webstore", element: <WebstorePage />},
  // {path: "news", element: <NewsPage />},
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="bg-linear-to-r from-gray-700 via-black to-gray-700 text-white w-screen h-screen absolute top-0 left-0 flex items-center justify-center">
      <RouterProvider router={router} />
    </div>
=======
      <RouterProvider router={router} />
    <App />
  </div>
>>>>>>> d6cd6fd (backend: file server started)
  </StrictMode >,
)
