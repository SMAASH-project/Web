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
import { Link } from "react-router-dom";

export function PasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full max-w-md px-4 sm:px-0", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recover your account</CardTitle>
          <CardDescription>
            Enter your email below to change your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-900!">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" className="text-white">
                  Reset Password
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
