import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Linkedin, Instagram, Facebook } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black text-white">
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6 text-black" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-900 sm:bg-[#1f2937]">
            <nav className="flex flex-col space-y-4 text-lg font-medium">
              <Link href="#" className="text-white" prefetch={false}>
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
          <Link href="#" className="text-white" prefetch={false}>
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
      <main>
        <section className="flex flex-col items-center justify-center h-screen bg-cover bg-center relative">
          <video
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-6xl font-bold">Welcome to</h1>
            <h2 className="text-8xl font-bold mt-4">CIOFF</h2>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 mb-4 gap-[0.1rem]">
            <Link href="#">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </section>
        <section className="bg-gray-900 py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Input placeholder="Explore events" className="flex-1" />
              <Input placeholder="Choose a date" className="flex-1" />
              <Input placeholder="Add date" className="flex-1" />
              <Input placeholder="¿Cuántos?" className="flex-1" />
              <Button variant="ghost" size="icon" className="rounded-full">
                <SearchIcon className="text-white" />
              </Button>
            </div>
          </div>
        </section>
        <section className="bg-gray-800 py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <CalendarIcon />
                <span>New events</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white hover:text-black rounded-lg py-[0.15rem]"
              >
                <GlobeIcon />
                <span>International</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <CogIcon />
                <span>CIOFF</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <BabyIcon />
                <span>Childrens</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <SirenIcon />
                <span>Folk Singing</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <DrumIcon />
                <span>Folk dance</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <FishIcon />
                <span>Folk music</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <CookingPotIcon />
                <span>Traditional food</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-white rounded-lg py-[0.15rem]"
              >
                <TruckIcon />
                <span>Traditional trade</span>
              </Button>
            </div>
          </div>
        </section>
        <section className="bg-gray-900 py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                <iframe
                  style={{ border: 0 }}
                  className="w-full h-full"
                  loading="lazy"
                  src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBRO_oBiyzOAQbH7Jcv3ZrgOgkfNp1wJeI&center=0,-28.50&zoom=2"
                ></iframe>
              </div>
              <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-lg" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm sm:text-base">
                        FOLKLORE CIRCUIT CARIBBEAN INTERNATIONAL
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Date: 18/02/2024
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Place: Barranquilla, Colombia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-lg" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm sm:text-base">
                        RENCINTRES DE INTERNATIONAL FOLKLORE
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Date: 19/08/2024
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Place: Fribourg, Switzerland
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-lg" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm sm:text-base">
                        VALIANT INTERNATIONAL CHEMNITZ FOLKLORE FESTIVAL
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Date: 20/08/2024
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Place: Vantaa, Finland
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-900 py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Latest news
            </h2>
            <div className="flex flex-col space-y-4 mt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-32 sm:h-48 bg-gray-700 rounded-lg" />
                </div>
                <h3 className="text-white mt-2 text-sm sm:text-base">
                  Bruno Ravnikar – In memoriam
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">11 Sept 2023</p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  We are hear to remember the Master, colleague and dear friend
                  Bruno...
                </p>
              </div>
              <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-32 sm:h-48 bg-gray-700 rounded-lg" />
                </div>
                <h3 className="text-white mt-2 text-sm sm:text-base">
                  51st CIOFF World Congress in Puerto Vallarta, Jalisco; Mexico.
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">19 Oct 2022</p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  We want to thank Dr. Ismael García Ávila, President of CIOFF
                  Mexico...
                </p>
              </div>
              <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-32 sm:h-48 bg-gray-700 rounded-lg" />
                </div>
                <h3 className="text-white mt-2 text-sm sm:text-base">
                  Welcome to the Netherlands
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">19 Oct 2022</p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Sector Meeting CIOFF® Central and Northern Europe Fifteen
                  delegates...
                </p>
              </div>
            </div>
            <Button variant="secondary" className="mt-4">
              All News
            </Button>
          </div>
        </section>
        <section className="bg-gray-900 py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Publish your event
            </h2>
            <div className="bg-gray-800 p-4 mt-4 rounded-lg">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Input
                  placeholder="Where will your event be?"
                  className="flex-1"
                />
                <Input placeholder="When is your event?" className="flex-1" />
                <Input
                  placeholder="Choose one or more categories"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 mt-4">
                <Input
                  placeholder="Enter the name of your event"
                  className="flex-1"
                />
                <Input
                  placeholder="Put the event logo here"
                  className="flex-1"
                />
              </div>
              <Textarea
                placeholder="Tell us about your event..."
                className="w-full mt-4"
              />
              <Button variant="secondary" className="mt-4">
                Submit
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 py-4 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">info@cioff.org</p>
          <Image
            src="/logo.png"
            width="100"
            height="100"
            alt="CIOFF Logo"
            className="inline-block my-6"
          />
          <p className="text-gray-400 text-xs sm:text-sm">
            © CIOFF 1998 - 2024 | cioff.org
          </p>
        </div>
      </footer>
    </div>
  );
}

type SVGComponentProps = React.ComponentPropsWithoutRef<"svg">;

function BabyIcon(props: SVGComponentProps) {
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
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    </svg>
  );
}

function CalendarIcon(props: SVGComponentProps) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function CogIcon(props: SVGComponentProps) {
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
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m17 20.66-1-1.73" />
      <path d="M11 10.27 7 3.34" />
      <path d="m20.66 17-1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <path d="M14 12h8" />
      <path d="M2 12h2" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m17 3.34-1 1.73" />
      <path d="m11 13.73-4 6.93" />
    </svg>
  );
}

function CookingPotIcon(props: SVGComponentProps) {
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
      <path d="M2 12h20" />
      <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
      <path d="m4 8 16-4" />
      <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
    </svg>
  );
}

function DrumIcon(props: SVGComponentProps) {
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
      <path d="m2 2 8 8" />
      <path d="m22 2-8 8" />
      <ellipse cx="12" cy="9" rx="10" ry="5" />
      <path d="M7 13.4v7.9" />
      <path d="M12 14v8" />
      <path d="M17 13.4v7.9" />
      <path d="M2 9v8a10 5 0 0 0 20 0V9" />
    </svg>
  );
}

function FishIcon(props: SVGComponentProps) {
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
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
      <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
    </svg>
  );
}

function GlobeIcon(props: SVGComponentProps) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
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

function SearchIcon(props: SVGComponentProps) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SirenIcon(props: SVGComponentProps) {
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
      <path d="M7 18v-6a5 5 0 1 1 10 0v6" />
      <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
      <path d="M21 12h1" />
      <path d="M18.5 4.5 18 5" />
      <path d="M2 12h1" />
      <path d="M12 2v1" />
      <path d="m4.929 4.929.707.707" />
      <path d="M12 12v6" />
    </svg>
  );
}

function TruckIcon(props: SVGComponentProps) {
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

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

function XIcon(props: SVGComponentProps) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
