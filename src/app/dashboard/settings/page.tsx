import Link from "next/link";
import { CircleUser, Menu, Package2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SettingProfile from "@/components/common/settings/profile";
import { auth } from "@/auth";
import { db } from "@/db";

export default async function DashboardPage() {
  const session = await auth();
  const currentInfo = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, session?.user.id!);
    },
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link href="#" className="font-semibold text-primary">
              Profile
            </Link>
            {/* <Link href="#">Security</Link> */}
            {/* <Link href="#">Integrations</Link> */}
            {/* <Link href="#">Support</Link> */}
            {/* <Link href="#">Organizations</Link> */}
            {/* <Link href="#">Advanced</Link> */}
          </nav>
          <div className="grid gap-6">
            <SettingProfile session={session!} currentInfo={currentInfo!} />
          </div>
        </div>
      </main>
    </div>
  );
}