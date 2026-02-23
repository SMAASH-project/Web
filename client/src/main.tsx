import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "./components/pages/profileDependents/settings/settingsLogic/SettingsContext.tsx";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "./components/pages/profileDependents/settings/settingsLogic/color/ColorProvider.tsx";
import { PasswordResetForm } from "./components/forms/PasswordResetForm.tsx";
import { ReleasesPage } from "./components/pages/mainPages/ReleasesPage.tsx";
import { AboutPage } from "./components/pages/mainPages/AboutPage.tsx";
import { GalleryPage } from "./components/pages/mainPages/GalleryPage.tsx";
import { WebstorePage } from "./components/pages/mainPages/WebstorePage.tsx";
import { NewsPage } from "./components/pages/mainPages/NewsPage.tsx";
import { NotFoundPage } from "./components/pages/mainPages/NotFoundPage.tsx";
import { ProfilePage } from "./components/pages/profileDependents/profile/ProfilePage.tsx";

import { Wrapper } from "./Wrapper.tsx";
import { LoginForm } from "./components/forms/LoginForm.tsx";
import { SignupForm } from "./components/forms/SignUpForm.tsx";
import { SettingsPage } from "./components/pages/profileDependents/settings/SettingsPage.tsx";

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
