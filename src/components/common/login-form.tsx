"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
import { Separator } from "@/components/ui/separator";
import { authenticate } from "@/app/actions";
import { encryptPassword } from "@/lib/utils";

function Submit({ label }: { label: string }) {
  const status = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={status.pending}
      disabled={status.pending}
    >
      {label}
    </Button>
  );
}

export default function LoginForm() {
  const [error, formAction] = useFormState(
    (prevState: string | undefined, formData: FormData) => {
      formData.set(
        "password",
        encryptPassword(formData.get("password") as string)
      );

      return authenticate(prevState, formData);
    },
    undefined
  );

  const translations = useTranslations("login");

  return (
    <div className="grid w-full h-screen grid-cols-1 lg:grid-cols-2">
      <form action={formAction} className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {translations("welcome")}
            </CardTitle>
            <CardDescription className="text-center">
              {translations("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{translations("email")}</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{translations("password")}</Label>
              <Input id="password" type="password" name="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-between">
            <Submit label={translations("login")} />
            <div className="flex justify-center mb-4">
              <Link href="mailto:legal@cioff.org">
                <Button variant="link" className="w-full mt-4">
                  {translations("become")}
                </Button>
              </Link>
            </div>
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
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="/login.jpg"
          alt="Image"
          fill
          className="!max-h-screen w-full object-cover"
        />
      </div>
    </div>
  );
}
