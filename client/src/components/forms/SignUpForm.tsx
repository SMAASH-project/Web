import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { generateRandomUsername } from "@/lib/GenerateRandomUsername";
import { useSignupMutation } from "@/hooks/useQueryHooks";
import {
  GoogleReCaptcha,
  GoogleReCaptchaProvider,
} from "react-google-recaptcha-v3";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const recaptchaSiteKey = "6LeA2IQsAAAAAAK7ljf7tDqBjwR_rm5uDAzGbr8S";
  const captchaEnabled = recaptchaSiteKey.trim().length > 0;
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState("");
  const navigate = useNavigate();
  const randomUsername = generateRandomUsername();
  const signupMutation = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username length
    if (username.length < 3) {
      setValidationError("Username must be at least 3 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }
    if (captchaEnabled && !captchaToken) {
      setValidationError("Captcha verification failed. Please try again.");
      return;
    }
    setValidationError("");

    try {
      await signupMutation.mutateAsync({ email, password, username });
      console.log("Signup successful");
      navigate("/app/login");
    } catch (err) {
      const error = err as { response?: { data?: string; status?: number } };
      console.error("Signup error:", err);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      console.error("Error status:", error?.response?.status);

      // Display backend error to user
      if (error?.response?.data) {
        setValidationError(error.response.data.toString());
      }
    }
  };
  return (
    <div className={cn("w-full max-w-md px-4 sm:px-0", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username" className="text-gray-900!">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder={`${randomUsername.prefix}${randomUsername.suffix}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={signupMutation.isPending}
                  required
                />
                <FieldDescription>
                  Must be at least 3 characters long.
                </FieldDescription>
              </Field>
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
                  disabled={signupMutation.isPending}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-gray-900!">
                  Password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={signupMutation.isPending}
                  required
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="confirm-password"
                  className="text-gray-900!"
                >
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={signupMutation.isPending}
                  required
                />
                <FieldDescription>Please confirm your password.</FieldDescription>
              </Field>
              {validationError && <p className="text-red-500">{validationError}</p>}
              {signupMutation.isError && (
                <p className="text-red-500">Signup failed</p>
              )}
              <Field>
                {captchaEnabled ? (
                  <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
                    <GoogleReCaptcha
                      onVerify={(token) => {
                        setCaptchaToken(token);
                      }}
                    />
                    <FieldDescription>
                      {captchaToken
                        ? "Captcha verified"
                        : "Verifying captcha..."}
                    </FieldDescription>
                  </GoogleReCaptchaProvider>
                ) : (
                  <FieldDescription>
                    Captcha key is empty. Captcha is currently disabled.
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="text-white"
                  disabled={
                    signupMutation.isPending || (captchaEnabled && !captchaToken)
                  }
                >
                  {signupMutation.isPending
                    ? "Creating Account..."
                    : captchaEnabled && !captchaToken
                      ? "Waiting for Captcha..."
                      : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/app/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
