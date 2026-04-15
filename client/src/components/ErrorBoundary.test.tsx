import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ReactElement } from "react";

function Crash(): ReactElement {
  throw new Error("Boom");
}

describe("ErrorBoundary", () => {
  it("renders fallback UI when child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Crash />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("renders custom fallback when provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom Error</div>}>
        <Crash />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
