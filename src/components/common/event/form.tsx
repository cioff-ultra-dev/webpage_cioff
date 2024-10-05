"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
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
import { updateFestival } from "@/app/actions";
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
  insertFestivalLangSchema,
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
import {
  Calendar as CalendarIcon,
  CircleCheck,
  PlusCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import {
  addYears,
  endOfYear,
  format,
  isSameYear,
  isThisYear,
  startOfYear,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CategoryGroupWithCategories } from "@/db/queries/category-group";
import camelCase from "camelcase";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { useTranslations } from "next-intl";
import { FestivalBySlugType } from "@/db/queries/events";
import { toast } from "sonner";
import {
  DatePickerWithRange,
  DateRangeProps,
} from "@/components/ui/datepicker-with-range";

const dateRangeSchema = z.object({
  id: z.string().optional(),
  from: z.string(),
  to: z.string().optional(),
});

const globalEventSchema = insertFestivalSchema
  .merge(
    z.object({
      _currentDates: z
        .array(z.object({ _rangeDate: dateRangeSchema }))
        .nonempty(),
      _nextDates: z.array(z.object({ _rangeDate: dateRangeSchema })),
      _transportLocation: z.string().optional(),
      _ageOfParticipants: z.array(z.string()).nonempty(),
      _styleOfFestival: z.array(z.string()).nonempty(),
      _typeOfAccomodation: z.string().optional(),
      _typeOfFestival: z.array(z.string()).nonempty(),
      _status: z.string(),
      _email: z.string().email(),
      _lang: insertFestivalLangSchema,
      _accomodationPhoto: z.any().optional(),
    })
  )
  .refine(
    (data) => {
      return !data._typeOfAccomodation || data._accomodationPhoto;
    },
    {
      path: ["_accomodationPhoto"],
      params: { i18n: "file_required" },
    }
  );

function removeDuplicates(data: string[]) {
  return Array.from(new Set(Array.from(data)));
}

type KeyTypesFestivalSchema = keyof typeof globalEventSchema._type;

const singleMapCategory: Record<string, boolean> = {
  "type-of-accomodation": true,
};

function Submit({
  label = "Save",
  variant = "default",
  isLoading = false,
}: {
  label: string;
  variant?: ButtonProps["variant"];
  isLoading?: boolean;
}) {
  return (
    <Button
      type="submit"
      aria-disabled={isLoading}
      disabled={isLoading}
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
  currentFestival,
  currentOwner,
  currentLang,
  id,
  currentCategoriesSelected,
  slug,
}: {
  categoryGroups: CategoryGroupWithCategories[];
  languages: SelectLanguages[];
  statuses: SelectStatus[];
  currentFestival?: FestivalBySlugType | undefined;
  currentLang?: NonNullable<FestivalBySlugType>["langs"][number];
  currentOwner?: NonNullable<FestivalBySlugType>["owners"][number];
  currentCategoriesSelected?: string[];
  id?: string;
  slug?: string;
}) {
  useI18nZodErrors("festival");
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
      id: id ? Number(id) : 0,
      _nextDates:
        currentFestival?.events
          ?.filter((event) =>
            isSameYear(event.startDate!, addYears(new Date(), 1))
          )
          .map((event) => {
            return {
              _rangeDate: {
                id: event.id ? String(event.id) : "0",
                from: event.startDate?.toUTCString() ?? "",
                to: event.endDate?.toUTCString() ?? "",
              },
            };
          }) || [],
      directorName: currentFestival?.directorName ?? "",
      _currentDates:
        currentFestival?.events
          ?.filter((event) => isThisYear(event.startDate!))
          .map((event) => {
            return {
              _rangeDate: {
                id: event.id ? String(event.id) : "0",
                from: event.startDate?.toUTCString() ?? "",
                to: event.endDate?.toUTCString() ?? "",
              },
            };
          }) || [],
      contact: "__ad",
      peoples: currentFestival?.peoples ?? 0,
      phone: currentFestival?.phone ?? "",
      location: currentFestival?.location ?? "",
      lat: currentFestival?.lat ?? "",
      lng: currentFestival?.lng ?? "",
      translatorLanguages: currentFestival?.translatorLanguages ?? "",
      _ageOfParticipants: currentCategoriesSelected,
      _styleOfFestival: currentCategoriesSelected,
      _typeOfAccomodation:
        currentCategoriesSelected?.find((item) => {
          return categoryGroups
            .find((group) => group.slug === "type-of-accomodation")
            ?.categories.some((category) => item === String(category.id));
        }) ?? "",
      _typeOfFestival: currentCategoriesSelected,
      _status: currentFestival?.status?.id
        ? String(currentFestival?.status.id)
        : undefined,
      _email: currentOwner?.user?.email,
      _lang: {
        id: currentLang?.id ?? 0,
        name: currentLang?.name,
        description: currentLang?.description,
        otherTranslatorLanguage: currentLang?.otherTranslatorLanguage,
      },
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitForm: SubmitHandler<z.infer<typeof globalEventSchema>> = async (
    _data
  ) => {
    const result = await updateFestival(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    // customRevalidatePath(`/dashboard/national-sections/${slug}/edit`);
    // customRevalidatePath("/dashboard/national-sections");

    // if (result.success) {
    // router.push("/dashboard/national-sections");
    // }
  };

  const { fields: currentDateFields, append: appendCurrentDates } =
    useFieldArray({
      control: form.control,
      name: "_currentDates",
    });

  const { fields: nextDateFields, append: appendNextDates } = useFieldArray({
    control: form.control,
    name: "_nextDates",
  });

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
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      ref={field.ref}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      value={field.value}
                      name={field.name}
                      type="hidden"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="_lang.id"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      ref={field.ref}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      value={field.value}
                      name={field.name}
                      type="hidden"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="_lang.name"
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
                    />
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
                      name="_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input {...field} readOnly disabled />
                          </FormControl>
                          <FormDescription>
                            Current user owner of this festival
                          </FormDescription>
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
                              defaultPlace={field.value!}
                              onPlaceSelect={(currentPlace) => {
                                field.onChange(currentPlace?.formatted_address);
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
                    <input
                      type="hidden"
                      name="location"
                      value={form.getValues().location || ""}
                    />
                    <div className="rounded-xl py-4">
                      <Map
                        id="location_festival"
                        className="w-full h-[400px]"
                        defaultZoom={currentFestival?.lat ? 8 : 3}
                        defaultCenter={
                          currentFestival?.lat
                            ? {
                                lat: Number(currentFestival.lat),
                                lng: Number(currentFestival.lng),
                              }
                            : { lat: 0, lng: 0 }
                        }
                        gestureHandling={"greedy"}
                        disableDefaultUI={true}
                      >
                        {selectedPlace ||
                        (form.getValues().lat && form.getValues().lng) ? (
                          <Marker
                            position={{
                              lat:
                                selectedPlace?.geometry?.location?.lat()! ??
                                form.getValues().lat
                                  ? Number(form.getValues().lat)
                                  : 0,
                              lng:
                                selectedPlace?.geometry?.location?.lng()! ??
                                form.getValues().lng
                                  ? Number(form.getValues().lng)
                                  : 0,
                            }}
                          />
                        ) : null}
                      </Map>
                      <MapHandler
                        id="location_festival"
                        place={selectedPlace}
                        defaultZoom={currentFestival?.lat ? 8 : 3}
                      />
                    </div>
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="_lang.description"
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
                    />
                  </div>
                  <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold">Current Dates</h2>
                    {currentDateFields.map((field, index) => {
                      const positionIndex = index + 1;
                      return (
                        <div key={field.id} className="space-y-4 border-t pb-4">
                          <FormField
                            control={form.control}
                            name={`_currentDates.${index}._rangeDate.id`}
                            render={({ field }) => (
                              <FormControl>
                                <Input
                                  ref={field.ref}
                                  value={field.value}
                                  name={field.name}
                                  type="hidden"
                                />
                              </FormControl>
                            )}
                          />
                          <div className="grid w-full items-center gap-1.5">
                            <FormField
                              control={form.control}
                              name={`_currentDates.${index}._rangeDate`}
                              render={({ field: { value, onChange } }) => (
                                <FormItem>
                                  <FormLabel>Agenda {positionIndex}</FormLabel>
                                  <FormControl>
                                    <>
                                      <DatePickerWithRange
                                        className="w-full"
                                        buttonClassName="w-full"
                                        defaultDates={{
                                          from: form.getValues(
                                            `_currentDates.${index}._rangeDate.from`
                                          )
                                            ? new Date(
                                                form.getValues(
                                                  `_currentDates.${index}._rangeDate.from`
                                                )
                                              )
                                            : undefined,
                                          to:
                                            form.getValues(
                                              `_currentDates.${index}._rangeDate.to`
                                            ) &&
                                            form.getValues(
                                              `_currentDates.${index}._rangeDate.from`
                                            ) !==
                                              form.getValues(
                                                `_currentDates.${index}._rangeDate.to`
                                              )
                                              ? new Date(
                                                  form.getValues(
                                                    `_currentDates.${index}._rangeDate.to`
                                                  )!
                                                )
                                              : undefined,
                                        }}
                                        onValueChange={(rangeValue) => {
                                          onChange({
                                            from: rangeValue?.from?.toUTCString(),
                                            to:
                                              rangeValue?.to?.toUTCString() ??
                                              "",
                                          });
                                        }}
                                      />
                                      <input
                                        type="hidden"
                                        name={`_currentDates.${index}._rangeDate.from`}
                                        value={value.from}
                                      />
                                      <input
                                        type="hidden"
                                        name={`_currentDates.${index}._rangeDate.to`}
                                        value={value.to}
                                      />
                                    </>
                                  </FormControl>
                                  {form?.getFieldState(
                                    `_currentDates.${index}._rangeDate.from`
                                  ).error?.message ? (
                                    <p
                                      className={cn(
                                        "text-sm font-medium text-destructive"
                                      )}
                                    >
                                      {
                                        form?.getFieldState(
                                          `_currentDates.${index}._rangeDate.from`
                                        ).error?.message
                                      }
                                    </p>
                                  ) : null}
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendCurrentDates({ _rangeDate: { from: "" } })
                      }
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Current Date
                    </Button>
                    <input
                      type="hidden"
                      name="_currentDateSize"
                      value={currentDateFields.length}
                    />
                  </div>
                  <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold">Next Dates</h2>
                    {nextDateFields.map((field, index) => {
                      const positionIndex = index + 1;
                      return (
                        <div key={field.id} className="space-y-4 border-t pb-4">
                          <FormField
                            control={form.control}
                            name={`_nextDates.${index}._rangeDate.id`}
                            render={({ field }) => (
                              <FormControl>
                                <Input
                                  ref={field.ref}
                                  value={field.value}
                                  name={field.name}
                                  type="hidden"
                                />
                              </FormControl>
                            )}
                          />
                          <div className="grid w-full items-center gap-1.5">
                            <FormField
                              control={form.control}
                              name={`_nextDates.${index}._rangeDate`}
                              render={({ field: { value, onChange } }) => (
                                <FormItem>
                                  <FormLabel>
                                    Next Agenda {positionIndex}
                                  </FormLabel>
                                  <FormControl>
                                    <>
                                      <DatePickerWithRange
                                        className="w-full"
                                        buttonClassName="w-full"
                                        defaultDates={{
                                          from: form.getValues(
                                            `_nextDates.${index}._rangeDate.from`
                                          )
                                            ? new Date(
                                                form.getValues(
                                                  `_nextDates.${index}._rangeDate.from`
                                                )
                                              )
                                            : undefined,
                                          to:
                                            form.getValues(
                                              `_nextDates.${index}._rangeDate.to`
                                            ) &&
                                            form.getValues(
                                              `_nextDates.${index}._rangeDate.from`
                                            ) !==
                                              form.getValues(
                                                `_nextDates.${index}._rangeDate.to`
                                              )
                                              ? new Date(
                                                  form.getValues(
                                                    `_nextDates.${index}._rangeDate.to`
                                                  )!
                                                )
                                              : undefined,
                                        }}
                                        onValueChange={(rangeValue) => {
                                          onChange({
                                            from: rangeValue?.from?.toUTCString(),
                                            to:
                                              rangeValue?.to?.toUTCString() ??
                                              "",
                                          });
                                        }}
                                        fromDate={startOfYear(
                                          addYears(new Date(), 1)
                                        )}
                                        disabled={(date) => {
                                          return date < endOfYear(new Date());
                                        }}
                                      />
                                      <input
                                        type="hidden"
                                        name={`_nextDates.${index}._rangeDate.from`}
                                        value={value.from}
                                      />
                                      <input
                                        type="hidden"
                                        name={`_nextDates.${index}._rangeDate.to`}
                                        value={value.to}
                                      />
                                    </>
                                  </FormControl>
                                  {form?.getFieldState(
                                    `_nextDates.${index}._rangeDate.from`
                                  ).error?.message ? (
                                    <p
                                      className={cn(
                                        "text-sm font-medium text-destructive"
                                      )}
                                    >
                                      {
                                        form?.getFieldState(
                                          `_nextDates.${index}._rangeDate.from`
                                        ).error?.message
                                      }
                                    </p>
                                  ) : null}
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendNextDates({ _rangeDate: { from: "" } })
                      }
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Next Date
                    </Button>
                    <input
                      type="hidden"
                      name="_nextDateSize"
                      value={nextDateFields.length}
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
                      <div key={`${item.categories.length}-${item.slug}`}>
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
                                    defaultValue={(
                                      field.value as string[]
                                    ).filter((item) =>
                                      options.find(
                                        (option) => option.value === item
                                      )
                                    )}
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
                                    defaultValue={field.value}
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
                      [
                        ...removeDuplicates([
                          form.getValues("_typeOfAccomodation") ?? "",
                          ...form.getValues("_typeOfFestival"),
                          ...form.getValues("_styleOfFestival"),
                          ...form.getValues("_ageOfParticipants"),
                        ]),
                      ]
                        .flat()
                        .filter(Boolean) || "[]"
                    )}
                  />
                  {form.getValues("_typeOfAccomodation") ? (
                    <div className="pl-5 border-l">
                      <FormField
                        control={form.control}
                        name="_accomodationPhoto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload a picture</FormLabel>
                            <FormControl>
                              <Input
                                onChange={(event) => {
                                  field.onChange(
                                    event.target.files && event.target.files[0]
                                  );
                                }}
                                accept="image/*"
                                ref={field.ref}
                                type="file"
                              />
                            </FormControl>
                            <FormDescription>
                              Only available for users
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : null}
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
                                defaultValue={field.value?.split(",")}
                                onValueChange={(values) => {
                                  setSelectedLanguages(values);
                                  form.setValue(
                                    "translatorLanguages",
                                    values?.join(",")
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
                      value={form.getValues("translatorLanguages")!}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="_lang.otherTranslatorLanguage"
                      render={({ field: { value, ...restFields } }) => (
                        <FormItem>
                          <FormLabel>
                            Other language your translator know to speak
                          </FormLabel>
                          <FormControl>
                            <Input {...restFields} value={value ?? ""} />
                          </FormControl>
                          <FormDescription>
                            Include another language that support
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
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
                            <Input
                              ref={field.ref}
                              onChange={(event) => {
                                field.onChange(Number(event.target.value));
                              }}
                              onBlur={field.onBlur}
                              value={
                                field.value ? String(field.value) : undefined
                              }
                              name={field.name}
                              type="number"
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
                  {form.getValues("_status") &&
                  statuses.some(
                    (status) =>
                      String(status.id) === form.getValues("_status") &&
                      status.slug === "recognized-festival"
                  ) ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recognition</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="recognizedSince">
                            Recognized since
                          </Label>
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
                  ) : null}
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
                    <Submit
                      label="Publish"
                      isLoading={form.formState.isSubmitting}
                    />
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
