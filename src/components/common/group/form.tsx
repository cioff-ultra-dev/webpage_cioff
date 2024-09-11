"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/app/actions";
import { useFormState, useFormStatus } from "react-dom";
import * as RPNInput from "react-phone-number-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhoneInput } from "@/components/ui/phone-input";
import { insertFestivalSchema } from "@/db/schema";
import { AutocompletePlaces } from "@/components/ui/autocomplete-places";
import MapHandler from "@/components/common/map-handler";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addYears, endOfYear, format, startOfYear, subYears } from "date-fns";
import { Badge } from "@/components/ui/badge";

const globalEventSchema = insertFestivalSchema.merge(
  z.object({
    _currentDates: z.array(z.date()).nonempty(),
    _nextDates: z.array(z.date()),
  })
);

function Submit() {
  const status = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={status.pending}
      disabled={status.pending}
    >
      Save
    </Button>
  );
}

export default function GroupForm() {
  const [state, formAction] = useFormState(createEvent, undefined);
  const [travelWithMusic, setTravelWithMusic] = useState<string>("no");
  const [groupType, setGroupType] = useState<string>("only_dance");
  const [groupAges, setGroupAges] = useState<string[]>([]);
  const [travelAvailability, setTravelAvailability] = useState<string>("no");
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  const form = useForm<z.infer<typeof globalEventSchema>>({
    resolver: zodResolver(globalEventSchema),
    defaultValues: {
      _nextDates: [],
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="w-full p-4 md:p-6 ">
      <h1 className="text-2xl font-bold">ADD A GROUP</h1>
      <p className="text-sm text-muted-foreground pb-1">
        The fields with * are mandatory.
      </p>
      <Form {...form}>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(evt) => {
            evt.preventDefault();
            form.handleSubmit((data) => {
              formAction(new FormData(formRef.current!));
            })(evt);
          }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="py-4">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Module 1</h2>
                <div>
                  <Label htmlFor="group-name">Name of the group</Label>
                  <Input
                    id="group-name"
                    placeholder="Filled automatically from the list provided by NS"
                    readOnly
                  />
                </div>
                <div>
                  <Label
                    htmlFor="general-director"
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    General Director name
                  </Label>
                  <Input id="general-director" required />
                </div>
                <div>
                  <Label htmlFor="general-director-profile">
                    General Director profile
                  </Label>
                  <Textarea
                    id="general-director-profile"
                    placeholder="Write a short description of your main achievements, studies, etc - Max 500 words"
                    className="h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="artistic-director">
                    Artistic Director name
                  </Label>
                  <Input id="artistic-director" />
                </div>
                <div>
                  <Label htmlFor="artistic-director-profile">
                    Artistic Director profile
                  </Label>
                  <Textarea
                    id="artistic-director-profile"
                    placeholder="Write a short description of your main achievements, studies, etc - Max 500 words"
                    className="h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="director-photo">Director's photo</Label>
                  <Input id="director-photo" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground mt-1">
                    min 600x600px
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone (country code)</Label>
                  <Input id="phone" type="tel" />
                </div>
                <div>
                  <Label htmlFor="mail">Mail address</Label>
                  <Input id="mail" type="email" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Group Details</h2>
                <div>
                  <Label>Type of group</Label>
                  <RadioGroup value={groupType} onValueChange={setGroupType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="only_dance" id="only-dance" />
                      <Label htmlFor="only-dance">Only dance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="only_music" id="only-music" />
                      <Label htmlFor="only-music">Only music</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="dance_and_music"
                        id="dance-and-music"
                      />
                      <Label htmlFor="dance-and-music">Dance & Music</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Are you able to travel with live music?</Label>
                  <RadioGroup
                    value={travelWithMusic}
                    onValueChange={setTravelWithMusic}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="travel-music-yes" />
                      <Label htmlFor="travel-music-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="travel-music-no" />
                      <Label htmlFor="travel-music-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="short-description">Short description</Label>
                  <Textarea
                    id="short-description"
                    placeholder="Max 500 words"
                    className="h-32"
                  />
                </div>
                <div>
                  <Label>Group age</Label>
                  <div className="space-y-2">
                    {["Seniors", "Youth / Adults", "Teenagers", "Children"].map(
                      (age) => (
                        <div key={age} className="flex items-center space-x-2">
                          <Checkbox
                            id={age.toLowerCase().replace(" ", "-")}
                            checked={groupAges.includes(age)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setGroupAges([...groupAges, age]);
                              } else {
                                setGroupAges(
                                  groupAges.filter((a) => a !== age)
                                );
                              }
                            }}
                          />
                          <Label htmlFor={age.toLowerCase().replace(" ", "-")}>
                            {age}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    If they select more than one age
                  </p>
                </div>
                <div>
                  <Label htmlFor="number-of-members">Number of members</Label>
                  <Select>
                    <SelectTrigger id="number-of-members">
                      <SelectValue placeholder="Select number of members" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(30)].map((_, i) => (
                        <SelectItem key={i} value={`${i + 1}`}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    Do you have another contact person for your other group?
                  </Label>
                  <div className="space-y-2">
                    <Input placeholder="Name" />
                    <Input placeholder="Phone + Mail" />
                  </div>
                </div>
                <div>
                  <Label>Style of group</Label>
                  <RadioGroup defaultValue="authentic">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="authentic" id="authentic" />
                      <Label htmlFor="authentic">Authentic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="elaborated" id="elaborated" />
                      <Label htmlFor="elaborated">Elaborated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stylized" id="stylized" />
                      <Label htmlFor="stylized">Stylized</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4 py-4">
                <h2 className="text-2xl font-bold">Module 3</h2>
                <div>
                  <Label>Travelling availability</Label>
                  <RadioGroup
                    value={travelAvailability}
                    onValueChange={setTravelAvailability}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="travel-yes" />
                      <Label htmlFor="travel-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="travel-no" />
                      <Label htmlFor="travel-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {travelAvailability === "yes" && (
                  <>
                    <div>
                      <Label htmlFor="travel-date">Any specific date?</Label>
                      <Input id="travel-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="travel-region">
                        Any specific region?
                      </Label>
                      <Select>
                        <SelectTrigger id="travel-region">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="asia">Asia</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                          <SelectItem value="north-america">
                            North America
                          </SelectItem>
                          <SelectItem value="south-america">
                            South America
                          </SelectItem>
                          <SelectItem value="oceania">Oceania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Media</h2>
                <div>
                  <Label htmlFor="photos">Photos</Label>
                  <Input id="photos" type="file" accept="image/*" multiple />
                  <p className="text-sm text-muted-foreground mt-1">
                    Max 5 photos x 3MB each
                  </p>
                </div>
                <div>
                  <Label htmlFor="cover-photo">Cover photo</Label>
                  <Input id="cover-photo" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground mt-1">Size TBC</p>
                </div>
                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <Input id="logo" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground mt-1">Size TBC</p>
                </div>
                <div>
                  <Label htmlFor="video">Video</Label>
                  <Input id="video" placeholder="YouTube Link" />
                </div>
                <div>
                  <Label>Social media</Label>
                  <Input placeholder="Facebook link" className="mb-2" />
                  <Input placeholder="Instagram Link" className="mb-2" />
                  <Input placeholder="Website link" className="mb-2" />
                  <Input placeholder="Other" />
                </div>
                <div>
                  <Label htmlFor="repertoire">Repertoire</Label>
                  <Input id="repertoire" placeholder="Section 1 Name" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/events">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Submit />
          </div>
        </form>
      </Form>
    </div>
  );
}

// export default function EventForm({ eventTypes }: { eventTypes: Array<any> }) {
//   const [state, formAction] = useFormState(createEvent, undefined);

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-2xl font-bold">ADD AN EVENT</h1>
//       <p className="text-sm text-muted-foreground">
//         The fields with * are mandatory.
//       </p>
//       <form action={formAction}>
//         <section className="mt-6">
//           <h2 className="text-xl font-semibold">Basic Info</h2>
//           <div className="mt-4 space-y-4">
//             <div className="flex items-center space-x-4">
//               <label className="flex items-center space-x-2">
//                 <input type="radio" name="state_mode" value="online" />
//                 <span>Online</span>
//               </label>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   name="state_mode"
//                   value="offline"
//                   defaultChecked
//                 />
//                 <span>Offline</span>
//               </label>
//             </div>
//             <div>
//               <Label className="mb-2" htmlFor="type">
//                 Type *
//               </Label>
//               <Select>
//                 <SelectTrigger id="type">
//                   <SelectValue placeholder="Select a type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {eventTypes.map((item) => {
//                     return (
//                       <SelectItem key={item.slug} value={item.slug}>
//                         {item.name}
//                       </SelectItem>
//                     );
//                   })}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="title">Title *</Label>
//               <Input id="title" name="title" placeholder="Enter title" />
//             </div>
//             <div>
//               <Label htmlFor="description">Description *</Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 placeholder="Enter description"
//               />
//             </div>
//             <div>
//               <Label htmlFor="logo">Logo</Label>
//               <Input type="file" name="logo" id="logo" />
//               <p className="text-xs text-muted-foreground">
//                 The maximum size allowed for loading image is 384 pixels.
//               </p>
//             </div>
//             <div>
//               <Label htmlFor="url">Official Website (URL)</Label>
//               <Input
//                 id="url"
//                 name="url"
//                 placeholder="Enter URL"
//                 type="url"
//                 pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
//               />
//             </div>
//             <div className="flex items-center space-x-2">
//               <Checkbox id="approved" name="approved" />
//               <Label htmlFor="approved">Approved by CIOFF</Label>
//             </div>
//           </div>
//         </section>
//         <section className="mt-6">
//           <h2 className="text-xl font-semibold">Dates</h2>
//           <div className="mt-4 space-y-4">
//             {Array.from({ length: 5 }).map((_, index) => (
//               <div key={index} className="grid grid-cols-4 gap-4">
//                 <Label>Year {index + 1} *</Label>
//                 <Select>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Day" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Array.from({ length: 31 }).map((_, day) => (
//                       <SelectItem key={day} value={`${day + 1}`}>
//                         {day + 1}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <Select>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Month" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Array.from({ length: 12 }).map((_, month) => (
//                       <SelectItem key={month} value={`${month + 1}`}>
//                         {month + 1}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <Select>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Year" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Array.from({ length: 10 }).map((_, year) => (
//                       <SelectItem key={year} value={`${2023 + year}`}>
//                         {2023 + year}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             ))}
//           </div>
//         </section>
//         <section className="mt-6">
//           <h2 className="text-xl font-semibold">Place</h2>
//           <div className="mt-4 space-y-4">
//             <div>
//               <Label htmlFor="place-name">Name of the place</Label>
//               <Input id="place-name" placeholder="Enter place name" />
//             </div>
//             <div>
//               <Label htmlFor="address1">Address 1</Label>
//               <Input id="address1" placeholder="Enter address" />
//             </div>
//             <div>
//               <Label htmlFor="address2">Address 2</Label>
//               <Input id="address2" placeholder="Enter address" />
//             </div>
//             <div>
//               <Label htmlFor="zip">ZIP</Label>
//               <Input id="zip" placeholder="Enter ZIP code" />
//             </div>
//             <div>
//               <Label htmlFor="city">City</Label>
//               <Input id="city" placeholder="Enter city" />
//             </div>
//             <div>
//               <Label htmlFor="country">Country</Label>
//               <Select>
//                 <SelectTrigger id="country">
//                   <SelectValue placeholder="Select a country" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="country1">Country 1</SelectItem>
//                   <SelectItem value="country2">Country 2</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </section>
//         <section className="mt-6">
//           <h2 className="text-xl font-semibold">Contact</h2>
//           <div className="mt-4 space-y-4">
//             <div>
//               <Label htmlFor="contact-name">Name of the contact</Label>
//               <Input id="contact-name" placeholder="Enter contact name" />
//             </div>
//             <div>
//               <Label htmlFor="phone">Phone</Label>
//               <Input id="phone" placeholder="Enter phone number" />
//             </div>
//             <div>
//               <Label htmlFor="fax">Fax</Label>
//               <Input id="fax" placeholder="Enter fax number" />
//             </div>
//             <div>
//               <Label htmlFor="mobile">Mobile</Label>
//               <Input id="mobile" placeholder="Enter mobile number" />
//             </div>
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" placeholder="Enter email address" />
//             </div>
//           </div>
//         </section>
//         <section className="mt-6">
//           <h2 className="text-xl font-semibold">Categories</h2>
//           <div className="mt-4 space-y-4">
//             {/* <div className="flex items-center space-x-2"> */}
//             {/*   <Checkbox id="cioff" /> */}
//             {/*   <Label htmlFor="cioff">CIOFF</Label> */}
//             {/*   <Checkbox id="cioff-label" /> */}
//             {/*   <Label htmlFor="cioff-label">CIOFF Label</Label> */}
//             {/*   <Select> */}
//             {/*     <SelectTrigger> */}
//             {/*       <SelectValue placeholder="Day" /> */}
//             {/*     </SelectTrigger> */}
//             {/*     <SelectContent> */}
//             {/*       {Array.from({ length: 31 }).map((_, day) => ( */}
//             {/*         <SelectItem key={day} value={day + 1}> */}
//             {/*           {day + 1} */}
//             {/*         </SelectItem> */}
//             {/*       ))} */}
//             {/*     </SelectContent> */}
//             {/*   </Select> */}
//             {/*   <Select> */}
//             {/*     <SelectTrigger> */}
//             {/*       <SelectValue placeholder="Month" /> */}
//             {/*     </SelectTrigger> */}
//             {/*     <SelectContent> */}
//             {/*       {Array.from({ length: 12 }).map((_, month) => ( */}
//             {/*         <SelectItem key={month} value={month + 1}> */}
//             {/*           {month + 1} */}
//             {/*         </SelectItem> */}
//             {/*       ))} */}
//             {/*     </SelectContent> */}
//             {/*   </Select> */}
//             {/*   <Select> */}
//             {/*     <SelectTrigger> */}
//             {/*       <SelectValue placeholder="Year" /> */}
//             {/*     </SelectTrigger> */}
//             {/*     <SelectContent> */}
//             {/*       {Array.from({ length: 10 }).map((_, year) => ( */}
//             {/*         <SelectItem key={year} value={2023 + year}> */}
//             {/*           {2023 + year} */}
//             {/*         </SelectItem> */}
//             {/*       ))} */}
//             {/*     </SelectContent> */}
//             {/*   </Select> */}
//             {/* </div> */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="international"
//                   name="categories"
//                   value="international"
//                 />
//                 <Label htmlFor="international">International</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="children-festival"
//                   name="categories"
//                   value="children-festival"
//                 />
//                 <Label htmlFor="children-festival">Children Festival</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="folk-singing"
//                   name="categories"
//                   value="folk-singing"
//                 />
//                 <Label htmlFor="folk-singing">Folk Singing</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox id="folk-dancing" name="categories" />
//                 <Label htmlFor="folk-dancing">Folk Dancing</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox id="folk-music" name="categories" />
//                 <Label htmlFor="folk-music">Folk Music</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox id="traditional-cooking" name="categories" />
//                 <Label htmlFor="traditional-cooking">Traditional Cooking</Label>
//               </div>
//               {/* <div> */}
//               {/*   <Label>Traditional Trade</Label> */}
//               {/*   <Checkbox id="traditional-trade" /> */}
//               {/* </div> */}
//               {/* <div> */}
//               {/*   <Label>Traditional Game</Label> */}
//               {/*   <Checkbox id="traditional-game" /> */}
//               {/* </div> */}
//               {/* <div> */}
//               {/*   <Label>Exposition</Label> */}
//               {/*   <Checkbox id="exposition" /> */}
//               {/* </div> */}
//               {/* <div> */}
//               {/*   <Label>Conference</Label> */}
//               {/*   <Checkbox id="conference" /> */}
//               {/* </div> */}
//               {/* <div> */}
//               {/*   <Label>Authentic</Label> */}
//               {/*   <Checkbox id="authentic" /> */}
//               {/* </div> */}
//               {/* <div> */}
//               {/*   <Label>Elaborate</Label> */}
//               {/*   <Checkbox id="elaborate" /> */}
//               {/* </div> */}
//               {/* <div> */}
//               {/*   <Label>Stylized</Label> */}
//               {/*   <Checkbox id="stylized" /> */}
//               {/* </div> */}
//             </div>
//           </div>
//         </section>
//         <section className="mt-6">
//           <h2 className="text-xl font-semibold">Pictures</h2>
//           <div className="mt-4 space-y-4">
//             {Array.from({ length: 4 }).map((_, index) => (
//               <div key={index}>
//                 <Label>Picture {index + 1}</Label>
//                 <Input type="file" />
//                 <p className="text-xs text-muted-foreground">
//                   The maximum size allowed for loading image is 384 pixels.
//                 </p>
//               </div>
//             ))}
//           </div>
//         </section>
//         <div className="mt-6 flex space-x-4">
//           <Button variant="outline">Cancel</Button>
//           <Button type="submit">Save</Button>
//         </div>
//       </form>
//     </div>
//   );
// }
