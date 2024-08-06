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
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  return (
    <div className="grid w-full h-screen grid-cols-1 lg:grid-cols-2 bg-gray-900 text-white">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {" "}
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
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
          <div className="my-4 text-center text-sm text-muted-foreground">
            <Link
              href="#"
              className="underline underline-offset-4"
              prefetch={false}
            >
              Forgot password?
            </Link>
          </div>
        </Card>
      </div>
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
