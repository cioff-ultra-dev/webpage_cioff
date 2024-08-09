import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SVGComponentProps = React.ComponentPropsWithoutRef<"svg">;

function UserIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export type HeaderProps = React.HTMLAttributes<HTMLElement>;

export function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "z-10 flex items-center justify-between px-4 py-4 sm:px-8 md:px-6",
        className,
      )}
      {...props}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6 text-black" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-gray-900 sm:bg-[#1f2937]">
          <nav className="flex flex-col space-y-4 text-lg font-medium">
            <Link href="/" className="text-white" prefetch={false}>
              <Image
                src="/logo.png"
                width="100"
                height="100"
                alt="CIOFF Logo"
              />
            </Link>
            <Link href="#" className="text-white" prefetch={false}>
              FOLKLORIADAS
            </Link>
            <Link href="#" className="text-white" prefetch={false}>
              NEWS
            </Link>
            <Link href="/event" className="text-white" prefetch={false}>
              EVENTS
            </Link>
            <Link href="#" className="text-white" prefetch={false}>
              MEMBERS
            </Link>
            <Link href="#" className="text-white" prefetch={false}>
              ABOUT
            </Link>
            <Link href="#" className="text-white" prefetch={false}>
              CONTACT
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="hidden space-x-4 sm:space-x-6 lg:flex items-center">
        <Link href="/" className="text-white" prefetch={false}>
          <Image src="/logo.png" width="100" height="100" alt="CIOFF Logo" />
        </Link>
      </nav>
      <nav className="hidden lg:flex space-x-4 sm:space-x-6">
        <Link href="#" className="text-white" prefetch={false}>
          FOLKLORIADAS
        </Link>
        <Link href="#" className="text-white" prefetch={false}>
          NEWS
        </Link>
        <Link href="/event" className="text-white" prefetch={false}>
          EVENTS
        </Link>
        <Link href="#" className="text-white" prefetch={false}>
          MEMBERS
        </Link>
        <Link href="#" className="text-white" prefetch={false}>
          ABOUT
        </Link>
        <Link href="#" className="text-white" prefetch={false}>
          CONTACT
        </Link>
      </nav>
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-white" prefetch>
          LOGIN
        </Link>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserIcon className="text-white" />
        </Button>
      </div>
    </header>
  );
}
