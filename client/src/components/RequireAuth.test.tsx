import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { AuthContext } from "@/context/AuthContext";

function renderProtectedRoute(isLoggedIn: boolean, isInitializing = false) {
  return render(
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        userId: null,
        setUserId: () => {},
        setIsLoggedIn: () => {},
        isAdmin: false,
        setIsAdmin: () => {},
        isSupport: false,
        setIsSupport: () => {},
      }}
    >
      <MemoryRouter initialEntries={["/app/releases"]}>
        <Routes>
          <Route path="/app/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/app/releases" element={<div>Releases Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("RequireAuth", () => {
  it("renders protected route when authenticated", () => {
    renderProtectedRoute(true);
    expect(screen.getByText("Releases Page")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", () => {
    renderProtectedRoute(false);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("shows loading state during auth initialization", () => {
    renderProtectedRoute(false, true);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
