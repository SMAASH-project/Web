import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/lib/i18n"; // must be imported before any component that calls useTranslation
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout.tsx";

// Eager load auth forms for better UX
import { LoginForm } from "./components/forms/LoginForm.tsx";
import { SignupForm } from "./components/forms/SignUpForm.tsx";
import { PasswordResetForm } from "./components/forms/PasswordResetForm.tsx";

// Lazy load heavy pages
const ReleasesPage = lazy(() =>
  import("./components/pages/mainPages/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
const AboutPage = lazy(() =>
  import("./components/pages/mainPages/AboutPage.tsx").then((m) => ({
    default: m.AboutPage,
  })),
);
const GalleryPage = lazy(() =>
  import("./components/pages/mainPages/GalleryPage.tsx").then((m) => ({
    default: m.GalleryPage,
  })),
);
const WebstorePage = lazy(() =>
  import("./components/pages/mainPages/WebstorePage.tsx").then((m) => ({
    default: m.WebstorePage,
  })),
);
const NewsPage = lazy(() =>
  import("./components/pages/mainPages/NewsPage.tsx").then((m) => ({
    default: m.NewsPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./components/pages/mainPages/NotFoundPage.tsx").then((m) => ({
    default: m.NotFoundPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./components/pages/profileDependents/profile/ProfilePage.tsx").then(
    (m) => ({ default: m.ProfilePage }),
  ),
);
const ProfileSelectorForm = lazy(() =>
  import("./components/forms/ProfileSelectorForm.tsx").then((m) => ({
    default: m.ProfileSelectorForm,
  })),
);
const SettingsPage = lazy(() =>
  import("./components/pages/profileDependents/settings/SettingsPage.tsx").then(
    (m) => ({ default: m.SettingsPage }),
  ),
);
const AdminPage = lazy(() =>
  import("./components/pages/profileDependents/admin/AdminPage.tsx").then(
    (m) => ({
      default: m.AdminPage,
    }),
  ),
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/app", element: <App /> },
      { path: "/app/login", element: <LoginForm /> },
      { path: "/app/signup", element: <SignupForm /> },
      {
        path: "/app/reset-password",
        element: <PasswordResetForm />,
      },
      { path: "/app/about", element: <AboutPage /> },
      { path: "/app/gallery", element: <GalleryPage /> },
      { path: "/app/releases", element: <ReleasesPage /> },
      { path: "/app/webstore", element: <WebstorePage /> },
      { path: "/app/news", element: <NewsPage /> },
      { path: "/app/profile", element: <ProfilePage /> },
      { path: "/app/settings", element: <SettingsPage /> },
      {
        path: "/app/profile-selector",
        element: <ProfileSelectorForm />,
      },
      { path: "*", element: <NotFoundPage /> },
      { path: "/app/admin", element: <AdminPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
