import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "./components/pages/profileDependents/settings/settingsLogic/SettingsContext.tsx";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "./components/pages/profileDependents/settings/settingsLogic/color/ColorProvider.tsx";
import { ProfileProvider } from "@/components/forms/addNewProfile/ProfilesContext";
import { PasswordResetForm } from "./components/forms/PasswordResetForm.tsx";
import { ReleasesPage } from "./components/pages/mainPages/ReleasesPage.tsx";
import { AboutPage } from "./components/pages/mainPages/AboutPage.tsx";
import { GalleryPage } from "./components/pages/mainPages/GalleryPage.tsx";
import { WebstorePage } from "./components/pages/mainPages/WebstorePage.tsx";
import { NewsPage } from "./components/pages/mainPages/NewsPage.tsx";
import { NotFoundPage } from "./components/pages/mainPages/NotFoundPage.tsx";
import { ProfilePage } from "./components/pages/profileDependents/profile/ProfilePage.tsx";
import { ProfileSelectorForm } from "./components/forms/ProfileSelectorForm.tsx";
import { LoginForm } from "./components/forms/LoginForm.tsx";
import { SignupForm } from "./components/forms/SignUpForm.tsx";
import { SettingsPage } from "./components/pages/profileDependents/settings/SettingsPage.tsx";
import { Wrapper } from "./Wrapper.tsx";

const router = createBrowserRouter([
  {
    path: "/app",
    element: (
      <Wrapper>
        <App />
      </Wrapper>
    ),
  },
  {
    path: "/app/login",
    element: (
      <Wrapper>
        <LoginForm className="w-100" />
      </Wrapper>
    ),
  },
  {
    path: "/app/signup",
    element: (
      <Wrapper>
        <SignupForm className="w-100" />
      </Wrapper>
    ),
  },
  {
    path: "/app/reset-password",
    element: (
      <Wrapper>
        <PasswordResetForm className="w-100" />
      </Wrapper>
    ),
  },
  {
    path: "/app/about",
    element: (
      <Wrapper>
        <AboutPage />
      </Wrapper>
    ),
  },
  {
    path: "/app/gallery",
    element: (
      <Wrapper>
        <GalleryPage />
      </Wrapper>
    ),
  },
  {
    path: "/app/releases",
    element: (
      <Wrapper>
        <ReleasesPage />
      </Wrapper>
    ),
  },
  {
    path: "/app/webstore",
    element: (
      <Wrapper>
        <WebstorePage />
      </Wrapper>
    ),
  },
  {
    path: "/app/news",
    element: (
      <Wrapper>
        <NewsPage />
      </Wrapper>
    ),
  },
  {
    path: "*",
    element: (
      <Wrapper>
        <NotFoundPage />
      </Wrapper>
    ),
  },
  {
    path: "/app/profile",
    element: (
      <Wrapper>
        <ProfilePage />
      </Wrapper>
    ),
  },
  {
    path: "/app/settings",
    element: (
      <Wrapper>
        <SettingsPage />
      </Wrapper>
    ),
  },
  {
    path: "/app/profile-selector",
    element: (
      <Wrapper>
        <ProfileSelectorForm />
      </Wrapper>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <NavbarProvider>
          <ColorProvider>
            <ProfileProvider>
              <RouterProvider router={router} />
            </ProfileProvider>
          </ColorProvider>
        </NavbarProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
);
