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
import { Button, ButtonProps } from "@/components/ui/button";
import { createFestival } from "@/app/actions";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { PlusCircle, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addYears, endOfYear, format, startOfYear, subYears } from "date-fns";
import { Badge } from "@/components/ui/badge";

const globalEventSchema = insertFestivalSchema.merge(
  z.object({
    _currentDates: z.array(z.date()).nonempty(),
    _nextDates: z.array(z.date()),
  })
);

function Submit({
  label = "Save",
  variant = "default",
}: {
  label: string;
  variant?: ButtonProps["variant"];
}) {
  const status = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={status.pending}
      disabled={status.pending}
      className="space-y-0"
      variant={variant}
    >
      {label}
    </Button>
  );
}

interface RepertoireItem {
  id: number;
  name: string;
  description: string;
  photos: FileList | null;
  video: string;
}

export default function GroupForm() {
  const [state, formAction] = useFormState(createFestival, undefined);
  const [groupType, setGroupType] = useState<string>("only_dance");
  const [travelAvailability, setTravelAvailability] = useState<string>("no");
  const [repertoire, setRepertoire] = useState<RepertoireItem[]>([
    { id: 1, name: "", description: "", photos: null, video: "" },
  ]);

  const addRepertoireItem = () => {
    const newId =
      repertoire.length > 0
        ? Math.max(...repertoire.map((item) => item.id)) + 1
        : 1;
    setRepertoire([
      ...repertoire,
      { id: newId, name: "", description: "", photos: null, video: "" },
    ]);
  };

  const removeRepertoireItem = (id: number) => {
    setRepertoire(repertoire.filter((item) => item.id !== id));
  };

  const updateRepertoireItem = (
    id: number,
    field: keyof RepertoireItem,
    value: string | FileList | null
  ) => {
    setRepertoire(
      repertoire.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module 1: Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Name of the group</Label>
                  <Input
                    id="groupName"
                    placeholder="Filled automatically from the list provided by NS"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generalDirectorName">
                    General Director name*
                  </Label>
                  <Input id="generalDirectorName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generalDirectorProfile">
                    General Director profile
                  </Label>
                  <Textarea
                    id="generalDirectorProfile"
                    placeholder="Write a short description of your main achievements, studies, etc - Max 500 words"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artisticDirectorName">
                    Artistic Director name
                  </Label>
                  <Input id="artisticDirectorName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artisticDirectorProfile">
                    Artistic Director profile
                  </Label>
                  <Textarea
                    id="artisticDirectorProfile"
                    placeholder="Write a short description of your main achievements, studies, etc - Max 500 words"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="directorPhoto">Director's photo</Label>
                  <Input id="directorPhoto" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground">min 600x600px</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (country code)</Label>
                  <Input id="phone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Mail address</Label>
                  <Input id="email" type="email" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Type of group</Label>
                  <RadioGroup value={groupType} onValueChange={setGroupType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dance" id="dance" />
                      <Label htmlFor="dance">Only dance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="music" id="music" />
                      <Label htmlFor="music">Only music</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Dance & Music</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Are you able to travel with live music?</Label>
                  <RadioGroup defaultValue="no">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes-travel" />
                      <Label htmlFor="yes-travel">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-travel" />
                      <Label htmlFor="no-travel">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short description</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Max 500 words"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Group age</Label>
                  <div className="flex space-x-4">
                    <Checkbox id="seniors" />
                    <Label htmlFor="seniors">Seniors</Label>
                    <Checkbox id="youth-adults" />
                    <Label htmlFor="youth-adults">Youth / Adults</Label>
                    <Checkbox id="teenagers" />
                    <Label htmlFor="teenagers">Teenagers</Label>
                    <Checkbox id="children" />
                    <Label htmlFor="children">Children</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberCount">Number of members</Label>
                  <Select>
                    <SelectTrigger id="memberCount">
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
                <div className="space-y-2">
                  <Label>
                    Do you have another contact person for your other group?
                  </Label>
                  <div className="space-y-2">
                    <Input placeholder="Name" />
                    <Input placeholder="Phone + Mail" />
                  </div>
                </div>
                <div className="space-y-2">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module 3: Travel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Are you available for travelling this year?</Label>
                  <RadioGroup
                    value={travelAvailability}
                    onValueChange={setTravelAvailability}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes-available" />
                      <Label htmlFor="yes-available">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-available" />
                      <Label htmlFor="no-available">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {travelAvailability === "yes" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="specificDate">
                        Any specific date? (calendar option)
                      </Label>
                      <Input id="specificDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specificRegion">
                        Any specific region?
                      </Label>
                      <Select>
                        <SelectTrigger id="specificRegion">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="asia">Asia</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                          <SelectItem value="northAmerica">
                            North America
                          </SelectItem>
                          <SelectItem value="southAmerica">
                            South America
                          </SelectItem>
                          <SelectItem value="oceania">Oceania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photos">Photos</Label>
                  <Input id="photos" type="file" accept="image/*" multiple />
                  <p className="text-sm text-muted-foreground">
                    Max 5 photos x 3MB each
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverPhoto">Cover photo</Label>
                  <Input id="coverPhoto" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground">Size TBC</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input id="logo" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground">Size TBC</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">Video</Label>
                  <Input id="video" placeholder="YouTube Link" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook link</Label>
                  <Input id="facebook" type="url" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Link</Label>
                  <Input id="instagram" type="url" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website link</Label>
                  <Input id="website" type="url" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repertoire</CardTitle>
                <CardDescription>
                  Add your performance repertoire details below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {repertoire.map((item, index) => (
                  <div
                    key={item.id}
                    className="space-y-4 p-4 border rounded-lg relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeRepertoireItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor={`section${item.id}Name`}>
                        Section {index + 1} Name
                      </Label>
                      <Input
                        id={`section${item.id}Name`}
                        value={item.name}
                        onChange={(e) =>
                          updateRepertoireItem(item.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`section${item.id}Description`}>
                        Description
                      </Label>
                      <Textarea
                        id={`section${item.id}Description`}
                        className="min-h-[100px]"
                        value={item.description}
                        onChange={(e) =>
                          updateRepertoireItem(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`section${item.id}Photos`}>
                        Photos in costume
                      </Label>
                      <Input
                        id={`section${item.id}Photos`}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          updateRepertoireItem(
                            item.id,
                            "photos",
                            e.target.files
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`section${item.id}Video`}>
                        Video (YouTube Link)
                      </Label>
                      <Input
                        id={`section${item.id}Video`}
                        placeholder="YouTube Link"
                        value={item.video}
                        onChange={(e) =>
                          updateRepertoireItem(item.id, "video", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRepertoireItem}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Repertoire Section
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupPortfolio">
                    Upload group portfolio/brochure
                  </Label>
                  <Input id="groupPortfolio" type="file" accept=".pdf" />
                  <p className="text-sm text-muted-foreground">
                    Only PDF - max 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="sticky bottom-5 mt-4 right-0 flex justify-end px-4">
            <Card className="flex justify-end gap-4 w-full">
              <CardContent className="flex-row items-center p-4 flex w-full justify-end">
                <div className="flex gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard/national-section">Cancel</Link>
                  </Button>
                  <Submit label="Save" />
                </div>
              </CardContent>
            </Card>
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
