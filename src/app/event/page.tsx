"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gallery } from "react-grid-gallery";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { images, CustomImage } from "./images";

const slides = images.map(({ original, width, height }) => ({
  src: original,
  width,
  height,
}));

export default function Event() {
  const [index, setIndex] = useState(-1);

  const handleClick = (index: number, _item: CustomImage) => setIndex(index);

  return (
    <div className="w-full bg-gray-900 text-white">
      <header className="z-10 flex items-center justify-between px-4 py-4 sm:px-8 md:px-6 border-b border-gray-800">
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
      <main className="p-4">
        <section className="mb-8">
          <div className="flex justify-between items-center my-4">
            <h1 className="text-2xl font-bold">
              International folk circuit of the Caribbean
            </h1>
            <Button variant="secondary">Contact us</Button>
          </div>
          <div>
            <Gallery
              images={images}
              onClick={handleClick}
              enableImageSelection={false}
            />
            <Lightbox
              slides={slides}
              open={index >= 0}
              index={index}
              close={() => setIndex(-1)}
            />
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Things you can find at this event</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc">
                <li>International</li>
                <li>Folk singing</li>
                <li>Folk dance</li>
                <li>Folk music</li>
                <li>Traditional food</li>
                <li>Traditional game</li>
                <li>Conference</li>
                <li>Exhibition</li>
                <li>Authentic</li>
                <li>Elaborated</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between grow">
              <div className="flex items-center space-x-4">
                <div>
                  <p>Start: 08 Aug 2024</p>
                  <p>End: 28 Aug 2024</p>
                  <p>
                    Traveling circuit on the Caribbean Coast of Colombia,
                    "Henrique Jato Torne" includes the festivals of Ciénaga,
                    Barranquilla, Cartagena, San Juan Nepomuceno, El Carmen de
                    Bolívar and Sincelejo.
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="mt-4">
                Contact us
              </Button>
            </CardContent>
          </Card>
        </div>
        <section className="mb-8 mt-8">
          <div className="flex justify-between items-center my-4">
            <h2 className="text-xl font-semibold">Festival Location</h2>
          </div>
          <iframe
            style={{ border: 0 }}
            className="w-full md:h-[40rem] rounded-sm h-[20rem]"
            loading="lazy"
            src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBRO_oBiyzOAQbH7Jcv3ZrgOgkfNp1wJeI&center=0,-28.50&zoom=2"
          ></iframe>
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
