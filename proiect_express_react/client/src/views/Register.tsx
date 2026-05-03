import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/useRegister";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";

export default function Register() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    onSubmit,
    isLoading,
    isError,
    error,
  } = useRegister();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input id="name" type="text" placeholder="John Doe" {...register("name")} />
                  {errors.name && (
                    <FieldDescription className="text-destructive">
                      {errors.name.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                  <FieldDescription>
                    We&apos;ll use this to contact you. We will not share your email with anyone else.
                  </FieldDescription>
                  {errors.email && (
                    <FieldDescription className="text-destructive">
                      {errors.email.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" {...register("password")} />
                  <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                  {errors.password && (
                    <FieldDescription className="text-destructive">
                      {errors.password.message}
                    </FieldDescription>
                  )}
                </Field>
                {isError && (
                  <div
                    className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                    role="alert"
                  >
                    {error?.message || "An error occurred during registration."}
                  </div>
                )}
                <Field>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="iAgree"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="iAgree"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label
                      htmlFor="iAgree"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                    >
                      I agree to the{" "}
                      <a href="#" className="underline underline-offset-2 hover:text-primary">
                        terms and conditions
                      </a>
                    </label>
                  </div>
                  {errors.iAgree && (
                    <FieldDescription className="text-destructive">
                      {errors.iAgree.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  <Button variant="outline" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
