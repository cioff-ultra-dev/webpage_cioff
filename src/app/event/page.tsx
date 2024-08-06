"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gallery } from "react-grid-gallery";
import { Skeleton } from "@/components/ui/skeleton";
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

  const handleClick = (index: number, item: CustomImage) => setIndex(index);

  return (
    <div className="w-full bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <nav className="flex space-x-4">
          <Link href="/" className="text-sm font-medium" prefetch={false}>
            HOME
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            FOLKLORIADAS
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            NEWS
          </Link>
          <Link href="/event" className="text-sm font-medium" prefetch={false}>
            EVENTS
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            MEMBERS
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            ABOUT
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            CONTACT
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium" prefetch={false}>
            LOGIN
          </Link>
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
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
              <ul className="space-y-2">
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
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-xl font-semibold">Festival Location</h2>
          </div>
          <img
            src="https://generated.vusercontent.net/placeholder.svg"
            alt="Map"
            className="w-full mt-4"
          />
        </section>
      </main>

      <footer className="bg-gray-900 py-4 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">info@cioff.org</p>
          <Skeleton className="h-[125px] w-[250px] rounded-xl inline-block m-2" />
          <p className="text-gray-400 text-xs sm:text-sm">
            © CIOFF 1998 - 2024 | cioff.org
          </p>
        </div>
      </footer>
    </div>
  );
}
