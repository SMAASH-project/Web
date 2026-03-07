import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useLoginMutation } from "@/hooks/useQueryHooks";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const { isLoggedIn, setIsLoggedIn, setUserId } =
    React.useContext(AuthContext);

  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const parseUserId = (value: unknown): bigint | null => {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" && Number.isFinite(value)) {
      return BigInt(Math.trunc(value));
    }
    if (typeof value === "string" && value.trim() !== "") {
      try {
        return BigInt(value);
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset stale auth state first so a previous account cannot leak through.
    setIsLoggedIn(false);
    setUserId(null);

    try {
      const response = await loginMutation.mutateAsync({ email, password });

      const parsedUserId = parseUserId(response?.id);
      if (parsedUserId === null) {
        return;
      }

      console.log("Login successful");
      setUserId(parsedUserId);
      setIsLoggedIn(true);
    } catch {
      // Error is handled by mutation state
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/app/profile-selector");
    }
  }, [navigate, isLoggedIn]);

  return (
    <div className={cn("w-100 flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-900!">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-gray-900!">
                    Password
                  </FieldLabel>
                  <Link
                    to="/app/reset-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </Field>
              {loginMutation.isError && (
                <p className="text-red-500">
                  {String(loginMutation.error?.response?.data) ||
                    "Login failed"}
                </p>
              )}
              <Field>
                <Button
                  type="submit"
                  id="login-button"
                  className="text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link to="/app/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
