import React, { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/lib/i18n.ts";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

// Eager load auth forms for better UX
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import { SignUpPage } from "./pages/auth/SignUpPage.tsx";
import { PasswordResetPage } from "./pages/auth/PasswordResetPage.tsx";

// Lazy load heavy pages
const ReleasesPage = lazy(() =>
  import("./pages/releases/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
const LeaderboardPage = lazy(() =>
  import("./pages/leaderboard/LeaderboardPage.tsx").then((m) => ({
    default: m.LeaderboardPage,
  })),
);
const GalleryPage = lazy(() =>
  import("./pages/gallery/GalleryPage.tsx").then((m) => ({
    default: m.GalleryPage,
  })),
);
const WebstorePage = lazy(() =>
  import("./pages/webstore/WebstorePage.tsx").then((m) => ({
    default: m.WebstorePage,
  })),
);
const NewsPage = lazy(() =>
  import("./pages/news/NewsPage.tsx").then((m) => ({
    default: m.NewsPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage.tsx").then((m) => ({
    default: m.NotFoundPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/profile/ProfilePage.tsx").then(
    (m) => ({ default: m.ProfilePage }),
  ),
);
const ProfileSelectorPage = lazy(() =>
  import("./pages/profile-selector/ProfileSelectorPage.tsx").then((m) => ({
    default: m.ProfileSelectorPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/settings/SettingsPage.tsx").then(
    (m) => ({ default: m.SettingsPage }),
  ),
);
const AdminPage = lazy(() =>
  import("./pages/admin/AdminPage.tsx").then(
    (m) => ({
      default: m.AdminPage,
    }),
  ),
);

const DebugPage = lazy(() =>
  import("./pages/debug/DebugPage.tsx").then(
    (m) => ({
      default: m.DebugPage,
    }),
  ),
);

function withBoundary(element: React.ReactNode) {
  return <ErrorBoundary>{element}</ErrorBoundary>;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/app", element: <App /> },
      { path: "/app/login", element: <LoginPage /> },
      { path: "/app/signup", element: <SignUpPage /> },
      { path: "/app/reset-password", element: <PasswordResetPage /> },
      { path: "/app/leaderboard", element: withBoundary(<LeaderboardPage />) },
      { path: "/app/gallery", element: withBoundary(<GalleryPage />) },
      { path: "/app/releases", element: withBoundary(<ReleasesPage />) },
      { path: "/app/webstore", element: withBoundary(<WebstorePage />) },
      { path: "/app/news", element: withBoundary(<NewsPage />) },
      { path: "/app/profile", element: withBoundary(<ProfilePage />) },
      { path: "/app/settings", element: withBoundary(<SettingsPage />) },
      { path: "/app/profile-selector", element: withBoundary(<ProfileSelectorPage />) },
      { path: "*", element: <NotFoundPage /> },
      { path: "/app/admin", element: withBoundary(<AdminPage />) },
      { path: "/app/debug", element: withBoundary(<DebugPage />) },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
