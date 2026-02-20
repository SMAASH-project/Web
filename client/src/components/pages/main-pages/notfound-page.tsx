import { Button } from "../../ui/button";

export function NotFoundPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Button className="mt-4" onClick={() => window.history.back()}>
        Return to Previous Page
      </Button>
    </div>
  );
}
