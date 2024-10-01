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
import { Button, type ButtonProps } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  insertFestivalSchema,
  SelectLanguages,
  SelectStatus,
} from "@/db/schema";
import { AutocompletePlaces } from "@/components/ui/autocomplete-places";
import MapHandler from "@/components/common/map-handler";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, CircleCheck } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { addYears, endOfYear, format, startOfYear } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CategoryGroupWithCategories } from "@/db/queries/category-group";
import camelCase from "camelcase";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { useTranslations } from "next-intl";

const globalEventSchema = insertFestivalSchema.merge(
  z.object({
    _currentDates: z.array(z.date()).nonempty(),
    _nextDates: z.array(z.date()),
    _transportLocation: z.string().optional(),
    _ageOfParticipants: z.array(z.string()).nonempty(),
    _styleOfFestival: z.array(z.string()).nonempty(),
    _typeOfAccomodation: z.string().optional(),
    _typeOfFestival: z.array(z.string()).nonempty(),
    _status: z.string(),
  })
);

type KeyTypesFestivalSchema = keyof typeof globalEventSchema._type;

const singleMapCategory: Record<string, boolean> = {
  "type-of-accomodation": true,
};

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

export default function EventForm({
  languages,
  categoryGroups,
  statuses,
}: {
  categoryGroups: CategoryGroupWithCategories[];
  languages: SelectLanguages[];
  statuses: SelectStatus[];
}) {
  useI18nZodErrors("festival");
  const [state, formAction] = useFormState(createFestival, undefined);
  const t = useTranslations("form.festival");
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedTransportPlace, setSelectedTransportPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedGroupCategories, setSelectedGroupCategories] = useState<
    Record<string, number[] | string[]>
  >({});
  const [selectedLanguanges, setSelectedLanguages] = useState<string[]>([]);
  const [progress, setProgress] = React.useState(13);
  const form = useForm<z.infer<typeof globalEventSchema>>({
    resolver: zodResolver(globalEventSchema),
    defaultValues: {
      _nextDates: [],
      directorName: "",
      contact: "",
      phone: "",
      location: "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <APIProvider apiKey={"AIzaSyBRO_oBiyzOAQbH7Jcv3ZrgOgkfNp1wJeI"}>
      <div className="w-full p-4 md:p-6 ">
        <h1 className="text-2xl font-bold">ADD AN FESTIVAL</h1>
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
                    {/* <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("name")}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your current festival name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="directorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("directorName")}
                          </FormLabel>
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
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Phone Number (country code)
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={value as RPNInput.Value}
                              id="phone"
                              placeholder="Enter a phone number"
                              international
                              {...fieldRest}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a phone number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Mail Address
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Location
                          </FormLabel>
                          <FormControl>
                            <AutocompletePlaces
                              id="location_festival"
                              {...field}
                              onPlaceSelect={(currentPlace) => {
                                setSelectedPlace(currentPlace);
                                form.setValue(
                                  "lat",
                                  `${currentPlace?.geometry?.location?.lat()}`
                                );
                                form.setValue(
                                  "lng",
                                  `${currentPlace?.geometry?.location?.lng()}`
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
                      name="lat"
                      value={form.getValues().lat || ""}
                    />
                    <input
                      type="hidden"
                      name="lng"
                      value={form.getValues().lng || ""}
                    />
                    <div className="rounded-xl py-4">
                      <Map
                        id="location_festival"
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
                      <MapHandler
                        id="location_festival"
                        place={selectedPlace}
                      />
                    </div>
                  </div>
                  <div>
                    {/* <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please write the year of creation of your festival"
                              className="resize-none h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can use max. 500 words for this input
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="_currentDates"
                      render={({
                        field: { value: fieldValue, ...restFields },
                      }) => {
                        return (
                          <FormItem className="flex flex-col">
                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                              Dates for current year
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl {...restFields}>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !fieldValue && "text-muted-foreground"
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
                                  selected={
                                    fieldValue as unknown as Array<Date>
                                  }
                                  onSelect={(selectedItems) => {
                                    // form.setValue(
                                    //   "currentDates",
                                    //   selectedItems
                                    //     ?.map((date) =>
                                    //       Math.round(+date / 1000)
                                    //     )
                                    //     .join(",") || ""
                                    // );
                                    restFields.onChange(selectedItems);
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
                              {fieldValue?.map((date) => {
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
                              value={fieldValue
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
                                  fromDate={startOfYear(
                                    addYears(new Date(), 1)
                                  )}
                                  selected={
                                    field.value as unknown as Array<Date>
                                  }
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
                  {categoryGroups.map((item) => {
                    const options: MultiSelectProps["options"] =
                      item.categories.map((category) => ({
                        label: category.name,
                        value: String(category.id),
                        caption: "",
                      }));
                    return (
                      <div key={`${item.id}-${item.slug}`}>
                        <FormField
                          control={form.control}
                          name={
                            `_${camelCase(
                              item.slug!
                            )}` as KeyTypesFestivalSchema
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(
                                  !singleMapCategory[item.slug!] &&
                                    "after:content-['*'] after:ml-0.5 after:text-red-500"
                                )}
                              >
                                {item.title}
                              </FormLabel>
                              <FormControl>
                                {!singleMapCategory[item.slug!] ? (
                                  <MultiSelect
                                    options={options}
                                    ref={field.ref}
                                    value={field.value as string[]}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      setSelectedGroupCategories(
                                        (prevState) => {
                                          return {
                                            ...prevState,
                                            [camelCase(item.slug!)]: value,
                                          };
                                        }
                                      );
                                    }}
                                    placeholder={`Select ${item.slug!.replaceAll(
                                      "-",
                                      " "
                                    )}`}
                                  />
                                ) : (
                                  <Select
                                    name={`_${camelCase(item.slug!)}`}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      setSelectedGroupCategories(
                                        (prevState) => {
                                          return {
                                            ...prevState,
                                            [camelCase(item.slug!)]: [value],
                                          };
                                        }
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="text-sm font-medium data-[placeholder]:text-muted-foreground">
                                      <SelectValue
                                        placeholder={`Select ${item.slug!.replaceAll(
                                          "-",
                                          " "
                                        )}`}
                                        className="text-muted-foreground"
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {item.categories.map((category) => (
                                        <SelectItem
                                          key={category.id}
                                          value={String(category.id)}
                                        >
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}
                  <input
                    type="hidden"
                    name="groupCategories"
                    value={JSON.stringify(
                      Object.values(selectedGroupCategories).flat() || "[]"
                    )}
                  />
                  <div>
                    <FormField
                      control={form.control}
                      name="_transportLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transport</FormLabel>
                          <FormControl>
                            <AutocompletePlaces
                              id="transport_location_festival"
                              {...field}
                              onPlaceSelect={(currentPlace) => {
                                setSelectedTransportPlace(currentPlace);
                                form.setValue(
                                  "transportLat",
                                  `${currentPlace?.geometry?.location?.lat()}`
                                );
                                form.setValue(
                                  "transportLng",
                                  `${currentPlace?.geometry?.location?.lng()}`
                                );
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            What is the arrival city?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <input
                      type="hidden"
                      name="transportLat"
                      value={form.getValues().transportLat || ""}
                    />
                    <input
                      type="hidden"
                      name="transportLng"
                      value={form.getValues().transportLng || ""}
                    />
                    <div className="rounded-xl py-4">
                      <Map
                        id="transport_location_festival"
                        className="w-full h-[400px]"
                        defaultZoom={3}
                        defaultCenter={{ lat: 0, lng: 0 }}
                        gestureHandling={"greedy"}
                        disableDefaultUI={true}
                      >
                        {selectedTransportPlace ? (
                          <Marker
                            position={{
                              lat: selectedTransportPlace.geometry?.location?.lat()!,
                              lng: selectedTransportPlace.geometry?.location?.lng()!,
                            }}
                          />
                        ) : null}
                      </Map>
                      <MapHandler
                        id="transport_location_festival"
                        place={selectedTransportPlace}
                      />
                    </div>
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="translatorLanguages"
                      render={({ field }) => {
                        const options: MultiSelectProps["options"] =
                          languages.map((language) => ({
                            value: language.code || "",
                            label: language.name || "",
                            caption: "",
                          }));
                        return (
                          <FormItem>
                            <FormLabel>
                              What languages do your translators speak?
                            </FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={options}
                                onValueChange={(values) => {
                                  setSelectedLanguages(values);
                                  form.setValue(
                                    "translatorLanguages",
                                    JSON.stringify(values)
                                  );
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              {/* Enter the correct location place */}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <input
                      type="hidden"
                      name="translatorLanguages"
                      value={JSON.stringify(selectedLanguanges) || "[]"}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="peoples"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              How many persons do you accept per delegation?
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={
                                field.value ? `${field.value}` : undefined
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="font-medium data-[placeholder]:text-muted-foreground">
                                  <SelectValue placeholder="Select a verified peoples" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 40 }).map((_, index) => (
                                  <SelectItem
                                    key={`peoples-${index}`}
                                    value={String(index + 1)}
                                  >
                                    {index + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <input
                      type="hidden"
                      name="translatorLanguages"
                      value={JSON.stringify(selectedLanguanges) || "[]"}
                    />
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
                    <FormField
                      control={form.control}
                      name="_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            name={field.name}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem
                                  key={status.slug}
                                  value={String(status.id)}
                                >
                                  {status.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormDescription>
                            This is your current festival name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                        <Label htmlFor="traditionalFood">
                          Traditional food
                        </Label>
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
            <div className="sticky bottom-5 right-0 flex justify-end px-4">
              <Card className="flex justify-end gap-4 w-full">
                <CardContent className="flex-row items-center p-4 flex w-full justify-between">
                  <div className="flex-1">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Progress
                      {progress >= 50 && (
                        <CircleCheck
                          size={15}
                          className={cn(
                            (progress >= 50 || progress <= 99) &&
                              "text-primary",
                            progress === 100 && "text-green-600"
                          )}
                        />
                      )}
                    </Label>
                    <Progress
                      value={progress}
                      className={cn("w-[50%] h-2 mt-2")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/dashboard/festivals">Cancel</Link>
                    </Button>
                    <Submit label="Publish" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </APIProvider>
  );
}
