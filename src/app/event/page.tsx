import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Component() {
  return (
    <div className="w-full">
      <header className="flex items-center justify-between p-4 border-b">
        <nav className="flex space-x-4">
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            FESTIVALS
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            FOLKLORIADAS
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
            NEWS
          </Link>
          <Link href="#" className="text-sm font-medium" prefetch={false}>
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
          <Link href="#" className="text-sm font-medium" prefetch={false}>
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
          <h1 className="text-2xl font-bold">
            International folk circuit of the Caribbean
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <img
              src="https://generated.vusercontent.net/placeholder.svg"
              alt="Main Event"
              className="col-span-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <img
                src="https://generated.vusercontent.net/placeholder.svg"
                alt="Event Image 1"
              />
              <img
                src="https://generated.vusercontent.net/placeholder.svg"
                alt="Event Image 2"
              />
              <img
                src="https://generated.vusercontent.net/placeholder.svg"
                alt="Event Image 3"
              />
              <img
                src="https://generated.vusercontent.net/placeholder.svg"
                alt="Event Image 4"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-xl font-semibold">CIOFF COLOMBIA</h2>
            <Button variant="default">Contact us</Button>
          </div>
        </section>
        <Tabs defaultValue="photos" className="mb-8">
          <TabsList>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>
          <TabsContent value="photos">
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
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {/* <img src="/placeholder.svg" alt="Event Logo" /> */}
                    <div>
                      <p>Start: 08 Aug 2024</p>
                      <p>End: 28 Aug 2024</p>
                      <p>
                        Traveling circuit on the Caribbean Coast of Colombia,
                        "Henrique Jato Torne" includes the festivals of Ciénaga,
                        Barranquilla, Cartagena, San Juan Nepomuceno, El Carmen
                        de Bolívar and Sincelejo.
                      </p>
                    </div>
                  </div>
                  <Button variant="default" className="mt-4">
                    Contact us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        <section className="mb-8">
          <Tabs defaultValue="photos" className="mb-8">
            <TabsList>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="location">
              <div className="flex justify-between items-center mt-4">
                <h2 className="text-xl font-semibold">Festival location</h2>
                <Button variant="default">Contact us</Button>
              </div>
              <img
                src="https://generated.vusercontent.net/placeholder.svg"
                alt="Map"
                className="w-full mt-4"
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
