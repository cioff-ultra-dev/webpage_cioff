"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/actions";

function Submit() {
  const status = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={status.pending}
      disabled={status.pending}
    >
      Sign in
    </Button>
  );
}

export default function LoginForm() {
  const [error, formAction, isPending] = useFormState(authenticate, undefined);
  return (
    <div className="grid w-full h-screen grid-cols-1 lg:grid-cols-2">
      <form action={formAction} className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button variant="secondary" className="w-full mt-4">
                I want my membership
              </Button>
            </div>
            <Separator className="my-4 " />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Submit />
          </CardFooter>
          <div className="mb-4 text-center text-sm text-muted-foreground flex justify-center items-center">
            {error && (
              <>
                <ExclamationTriangleIcon className="h-4 w-4 text-destructive mr-1" />
                <p className="text-[0.8rem] font-medium text-destructive">
                  {error}
                </p>
              </>
            )}
          </div>
        </Card>
      </form>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://generated.vusercontent.net/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
