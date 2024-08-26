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

export default function EventForm() {
  const [state, formAction] = useFormState(createEvent, undefined);
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
      <h1 className="text-2xl font-bold">ADD AN EVENT</h1>
      <p className="text-sm text-muted-foreground pb-6">
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
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name of the festival</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your current festival name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="directorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name of Director</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label>State Mode</Label>
                  <RadioGroup defaultValue="offline" name="stateMode">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="r1" />
                      <Label htmlFor="r1">Online</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="r2" />
                      <Label htmlFor="r2">Offline</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field: { value, ...fieldRest } }) => (
                      <FormItem>
                        <FormLabel>Phone Number (country code)</FormLabel>
                        <FormControl>
                          <PhoneInput
                            value={value as RPNInput.Value}
                            id="phone"
                            placeholder="Enter a phone number"
                            international
                            {...fieldRest}
                          />
                        </FormControl>
                        <FormDescription>Enter a phone number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="mailAddress">Mail Address</Label>
                  <Input id="mailAddress" name="mailAddress" />
                </div>
                <div>
                  <APIProvider
                    apiKey={"AIzaSyBRO_oBiyzOAQbH7Jcv3ZrgOgkfNp1wJeI"}
                  >
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <AutocompletePlaces
                              onPlaceSelect={(currentPlace) => {
                                setSelectedPlace(currentPlace);
                                form.setValue(
                                  "location",
                                  `${currentPlace?.geometry?.location?.lat()},${currentPlace?.geometry?.location?.lng()}`
                                );
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the correct location place
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <input
                      type="hidden"
                      name="location"
                      value={form.getValues().location || ""}
                    />
                    <MapHandler place={selectedPlace} />
                    <div className="rounded-xl py-4">
                      <Map
                        className="w-full h-[400px]"
                        defaultZoom={3}
                        defaultCenter={{ lat: 0, lng: 0 }}
                        gestureHandling={"greedy"}
                        disableDefaultUI={true}
                      >
                        {selectedPlace ? (
                          <Marker
                            position={{
                              lat: selectedPlace.geometry?.location?.lat()!,
                              lng: selectedPlace.geometry?.location?.lng()!,
                            }}
                          />
                        ) : null}
                      </Map>
                    </div>
                  </APIProvider>
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please write the year of creation of your festival"
                            className="resize-none h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          You can use max. 500 characters for this input
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="_currentDates"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>Dates for current year</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <span>Pick some dates date</span>
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="multiple"
                                selected={field.value as unknown as Array<Date>}
                                onSelect={(selectedItems) => {
                                  form.setValue(
                                    "currentDates",
                                    selectedItems
                                      ?.map((date) => Math.round(+date / 1000))
                                      .join(",") || ""
                                  );
                                  field.onChange(selectedItems);
                                }}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date >= startOfYear(addYears(new Date(), 1))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Your dates scheduled for this year
                          </FormDescription>
                          <FormMessage />
                          <div className="flex gap-2 flex-wrap">
                            {field.value?.map((date) => {
                              return (
                                <Badge key={Math.round(+date / 1000)}>
                                  {format(date, "PPP")}
                                </Badge>
                              );
                            })}
                          </div>
                          <input
                            type="hidden"
                            name="currentDates"
                            value={field.value
                              ?.map((date) => Math.round(+date / 1000))
                              .join(",")}
                          />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="_nextDates"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>Dates for the next years</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <span>Pick some dates</span>
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="multiple"
                                fromDate={startOfYear(addYears(new Date(), 1))}
                                selected={field.value as unknown as Array<Date>}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < endOfYear(new Date())
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Your dates scheduled for the next years
                          </FormDescription>
                          <FormMessage />
                          <div className="flex gap-2 flex-wrap">
                            {field.value?.map((date) => {
                              return (
                                <Badge key={Math.round(+date / 1000)}>
                                  {format(date, "PPP")}
                                </Badge>
                              );
                            })}
                          </div>
                          <input
                            type="hidden"
                            name="nextDates"
                            value={field.value
                              ?.map((date) => Math.round(+date / 1000))
                              .join(",")}
                          />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Type of festival</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dance" name="festivalType" value="dance" />
                      <Label htmlFor="dance">Dance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="music" name="festivalType" value="music" />
                      <Label htmlFor="music">Music</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Age of participants</Label>
                  <Select name="ageGroup">
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="adults">Adults</SelectItem>
                      <SelectItem value="seniors">Seniors</SelectItem>
                      <SelectItem value="teenagers">Teenagers</SelectItem>
                      <SelectItem value="children">Children</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Style of festival</Label>
                  <Select name="festivalStyle">
                    <SelectTrigger>
                      <SelectValue placeholder="Select festival style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authentic">Authentic</SelectItem>
                      <SelectItem value="elaborated">Elaborated</SelectItem>
                      <SelectItem value="stylized">Stylized</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type of accomodation</Label>
                  <Select name="accomodationType">
                    <SelectTrigger>
                      <SelectValue placeholder="Select accomodation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">
                        Hotel, Hostel, Campus
                      </SelectItem>
                      <SelectItem value="family">Family Houses</SelectItem>
                      <SelectItem value="school">School, Gym Halls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status and Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recognized">
                        Recognized festival
                      </SelectItem>
                      <SelectItem value="partner">Partner festival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recognizedSince">Recognized since</Label>
                  <Input
                    id="recognizedSince"
                    name="recognizedSince"
                    placeholder="e.g., 2014 - 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="financialCompensation">
                    Financial compensation
                  </Label>
                  <Input
                    id="financialCompensation"
                    name="financialCompensation"
                    placeholder="If ticked: How much?"
                  />
                </div>
                <div>
                  <Label>Components</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="liveMusicRequired"
                        name="components"
                        value="liveMusicRequired"
                      />
                      <Label htmlFor="liveMusicRequired">
                        Live music required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="traditionalTrade"
                        name="components"
                        value="traditionalTrade"
                      />
                      <Label htmlFor="traditionalTrade">
                        Traditional trade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="traditionalFood"
                        name="components"
                        value="traditionalFood"
                      />
                      <Label htmlFor="traditionalFood">Traditional food</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exhibitions"
                        name="components"
                        value="exhibitions"
                      />
                      <Label htmlFor="exhibitions">Exhibitions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="traditionalGames"
                        name="components"
                        value="traditionalGames"
                      />
                      <Label htmlFor="traditionalGames">
                        Traditional games
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="workshops"
                        name="components"
                        value="workshops"
                      />
                      <Label htmlFor="workshops">Workshops</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="photos">Photos</Label>
                  <Input
                    id="photos"
                    name="photos"
                    type="file"
                    multiple
                    accept="image/*"
                  />
                  <p className="text-sm text-gray-500">
                    Max 5 photos x 3MB each
                  </p>
                </div>
                <div>
                  <Label htmlFor="coverPhoto">Cover photo</Label>
                  <Input
                    id="coverPhoto"
                    name="coverPhoto"
                    type="file"
                    accept="image/*"
                  />
                  <p className="text-sm text-gray-500">Size TBC</p>
                </div>
                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <Input id="logo" name="logo" type="file" accept="image/*" />
                  <p className="text-sm text-gray-500">Size TBC</p>
                </div>
                <div>
                  <Label htmlFor="youtubeId">Youtube Embed ID</Label>
                  <Input
                    id="youtubeId"
                    name="youtubeId"
                    placeholder="YouTube ID"
                  />
                </div>
                <div>
                  <Label>Social media</Label>
                  <div className="space-y-2">
                    <Input name="facebook" placeholder="Facebook link" />
                    <Input name="instagram" placeholder="Instagram Link" />
                    <Input name="website" placeholder="Website link" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cioffGroups">
                  Do you have any CIOFF groups confirmed so far?
                </Label>
                <Select name="cioffGroups">
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lookingForGroups">
                  Are you looking for groups?
                </Label>
                <Select name="lookingForGroups">
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recognition Certification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recognitionCertificate">
                  Upload recognition certificate
                </Label>
                <Input
                  id="recognitionCertificate"
                  name="recognitionCertificate"
                  type="file"
                />
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
