import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "./components/pages/profile-dependents/settings/settings-logic/SettingsContext.tsx";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "./components/pages/profile-dependents/settings/settings-logic/color/ColorProvider.tsx";
import { PasswordResetForm } from "./components/forms/Password-reset-form.tsx";
import { ReleasesPage } from "./components/pages/main-pages/Releases-page.tsx";
import { AboutPage } from "./components/pages/main-pages/About-page.tsx";
import { GalleryPage } from "./components/pages/main-pages/Gallery-page.tsx";
import { WebstorePage } from "./components/pages/main-pages/Webstore-page.tsx";
import { NewsPage } from "./components/pages/main-pages/News-page.tsx";
import { NotFoundPage } from "./components/pages/main-pages/Notfound-page.tsx";
import { ProfilePage } from "./components/pages/profile-dependents/profile/Profile-page.tsx";

import { Wrapper } from "./Wrapper.tsx";
import { LoginForm } from "./components/forms/Login-form.tsx";
import { SignupForm } from "./components/forms/Signup-form.tsx";
import { SettingsPage } from "./components/pages/profile-dependents/settings/settings-page.tsx";

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
        <NavbarProvider>
          <ColorProvider>
            <Wrapper>
              <RouterProvider router={router} />
            </Wrapper>
          </ColorProvider>
        </NavbarProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
);
