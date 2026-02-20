import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "./components/pages/Profile-Dependents/Settings/settings-logic/SettingsContext";
import { LoginForm } from "./components/Forms/login-form.tsx";
import { SignupForm } from "./components/Forms/signup-form.tsx";
import { PasswordResetForm } from "./components/Forms/passwordreset-form.tsx";
import { ReleasesPage } from "./components/pages/main-pages/releases-page.tsx";
import { AboutPage } from "./components/pages/main-pages/about-page.tsx";
import { GalleryPage } from "./components/pages/main-pages/gallery-page.tsx";
import { WebstorePage } from "./components/pages/main-pages/webstore-page.tsx";
import { NewsPage } from "./components/pages/main-pages/news-page.tsx";
import { NotFoundPage } from "./components/pages/main-pages/notfound-page.tsx";
import { ProfilePage } from "./components/pages/Profile-Dependents/Profile/profile-page.tsx";
import { SettingsPage } from "./components/pages/Profile-Dependents/Settings/settings-page.tsx";

const router = createBrowserRouter([
  { path: "/app", element: <App /> },
  { path: "/app/login", element: <LoginForm className="w-100" /> },
  { path: "/app/signup", element: <SignupForm className="w-100" /> },
  {
    path: "/app/reset-password",
    element: <PasswordResetForm className="w-100" />,
  },
  { path: "/app/about", element: <AboutPage /> },
  { path: "/app/gallery", element: <GalleryPage /> },
  { path: "/app/releases", element: <ReleasesPage /> },
  { path: "/app/webstore", element: <WebstorePage /> },
  { path: "/app/news", element: <NewsPage /> },
  { path: "*", element: <NotFoundPage /> },
  { path: "/app/profile", element: <ProfilePage /> },
  { path: "/app/settings", element: <SettingsPage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <div className=" bg-linear-to-r from-gray-700 via-black to-gray-700 text-white w-screen h-screen absolute top-0 left-0 flex items-center justify-center">
          <RouterProvider router={router} />
        </div>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
);
