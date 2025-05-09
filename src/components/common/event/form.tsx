"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import fetcher, { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Check,
  CircleCheck,
  MapPinIcon,
  PlusCircle,
  Trash,
  X,
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
import {
  buildFestival,
  ComponentsForGroupType,
  FestivalBySlugType,
} from "@/db/queries/events";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/ui/datepicker-with-range";
import { Session } from "next-auth";
import { customRevalidatePath } from "../revalidateTag";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CountryByLocaleType } from "@/db/queries/countries";
import useSWR from "swr";
import { RegionsType } from "@/db/queries/regions";
import { buildGroup } from "@/db/queries/groups";
import { FilepondImageUploader } from "@/components/extension/filepond-image-uploader";
import constants from "@/constants";
import FormStateNS from "./form-state-ns";
import { TreeSelect } from "../tree-select/select";
import { TreeNode } from "@/types/tree-select";
import { FilePondErrorDescription, FilePondFile } from "filepond";
import { CategoriesType } from "@/db/queries/categories";
import { CategoriesSelect } from "../categories-select";

const dateRangeSchema = z.object({
  id: z.string().optional(),
  from: z.string(),
  to: z.string().optional(),
});

const globalEventSchema = insertFestivalSchema.merge(
  z.object({
    _currentDates: z.array(z.object({ _rangeDate: dateRangeSchema })),
    _nextDates: z.array(z.object({ _rangeDate: dateRangeSchema })),
    _transportLocation: z.string().optional(),
    _typeOfAccomodation: z.string().optional(),
    _categories: z.array(z.string()).nonempty(),
    _status: z.string().optional(),
    _recognizedSince: z.string(),
    _recognizedRange: z.string(),
    _typeOfCompensation: z.string().optional(),
    _financialCompensation: z.string().optional(),
    _inKindCompensation: z.string().optional(),
    _componentsRecognized: z.array(z.string()).optional(),
    _componentsPartner: z.array(z.string()).optional(),
    _email: z.string().email(),
    _lang: insertFestivalLangSchema,
    _accomodationPhoto: z.any().optional(),
    _transportLocations: z.array(
      z.object({
        lat: z.string().optional(),
        lng: z.string().optional(),
        location: z.string().optional(),
      })
    ),
    _isFestivalsConnected: z.boolean().default(false).optional(),
    _isLookingForGroups: z.boolean().default(false).optional(),
    _isGroupsConfirmed: z.boolean().default(false).optional(),
    _countrySelected: z.string().optional(),
    _countryGroupSelected: z.string().optional(),
    _groupRegionSelected: z.string().optional(),
    _groupRegionsSelected: z.array(z.string()).optional(),
    _festivalListSelected: z.array(
      z.object({
        name: z.string().optional(),
        id: z.string().optional(),
        countryName: z.string().optional(),
        festivalId: z.string().optional(),
      })
    ),
    _groupListSelected: z.array(
      z.object({
        name: z.string().optional(),
        id: z.string().optional(),
        countryName: z.string().optional(),
        groupId: z.string().optional(),
      })
    ),
    stagePhotos: z.array(z.any().optional()).optional(),
  })
);
// .refine(
//   (data) => {
//     return !data._typeOfAccomodation || data._accomodationPhoto;
//   },
//   {
//     path: ["_accomodationPhoto"],
//     params: { i18n: "file_required" },
//   },
// );

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
  currentStatus,
  id,
  currentCategoriesSelected,
  componentsRecognized,
  componentsPartner,
  countries,
  regions,
  slug,
  locale,
  session,
}: {
  categoryGroups: CategoriesType;
  languages: SelectLanguages[];
  statuses: SelectStatus[];
  currentFestival?: FestivalBySlugType | undefined;
  currentLang?: NonNullable<FestivalBySlugType>["langs"][number];
  currentOwner?: NonNullable<FestivalBySlugType>["owners"][number];
  currentStatus?: NonNullable<FestivalBySlugType>["festivalsToStatuses"][number];
  currentCategoriesSelected?: string[];
  componentsRecognized?: ComponentsForGroupType;
  componentsPartner?: ComponentsForGroupType;
  countries?: CountryByLocaleType;
  regions?: RegionsType;
  id?: string;
  slug?: string;
  locale?: string;
  session?: Session;
}) {
  useI18nZodErrors("festival");
  const t = useTranslations("form.festival");
  const router = useRouter();
  const isNSAccount = session?.user.role?.name === "National Sections";
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedTransportPlace, setSelectedTransportPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedGroupCategories, setSelectedGroupCategories] = useState<
    Record<string, number[] | string[]>
  >({});
  const [selectedLanguanges, setSelectedLanguages] = useState<string[]>([]);
  const [progress, setProgress] = React.useState(13);
  const [coverFilesIds, setCoverFilesIds] = React.useState<
    { url: string; name: string }[]
  >(
    () =>
      currentFestival?.coverPhotos?.map((cover) => ({
        url: cover.photo?.url ?? "",
        name: cover.photo?.name ?? "",
      })) ?? []
  );
  const form = useForm<z.infer<typeof globalEventSchema>>({
    resolver: zodResolver(globalEventSchema),
    shouldUnregister: isNSAccount,
    defaultValues: {
      id: id ? Number(id) : 0,
      _nextDates:
        currentFestival?.events
          ?.filter((event) => !isSameYear(event.startDate!, new Date()))
          ?.map((event) => {
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
          ?.map((event) => {
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
      translatorLanguages: currentFestival?.translatorLanguages ?? null,
      _typeOfAccomodation: "",
      _categories: currentCategoriesSelected,
      _status: currentFestival?.status?.id
        ? String(currentFestival?.status.id)
        : undefined,
      _recognizedSince: currentStatus?.recognizedSince ?? "",
      _recognizedRange: currentStatus?.recognizedRange ?? "",
      _typeOfCompensation: currentStatus?.typeOfCompensation ?? undefined,
      _financialCompensation: currentStatus?.financialCompensation ?? undefined,
      _inKindCompensation:
        currentStatus?.inKindCompensation ?? "in-kind-compensation",
      _componentsRecognized:
        currentFestival?.festivalsToComponents
          ?.filter((item) => {
            return componentsRecognized?.some(
              (comp) => comp.id === item.componentId
            );
          })
          ?.map((item) => String(item.componentId)) ?? [],
      _componentsPartner:
        currentFestival?.festivalsToComponents
          ?.filter((item) => {
            return componentsPartner?.some(
              (comp) => comp.id === item.componentId
            );
          })
          ?.map((item) => String(item.componentId)) ?? [],
      _transportLocations:
        currentFestival?.transports.map((item) => ({
          lat: item.lat ?? "",
          lng: item.lng ?? "",
          location: item.location ?? "",
        })) || [],
      _email: currentFestival?.email ?? currentOwner?.user?.email,
      _lang: {
        id: currentLang?.id ?? 0,
        name: currentLang?.name,
        description: currentLang?.description,
        otherTranslatorLanguage: currentLang?.otherTranslatorLanguage,
      },
      _isFestivalsConnected: Boolean(
        currentFestival?.connections.length || undefined
      ),
      _festivalListSelected: currentFestival?.connections.map((item) => {
        return {
          festivalId: String(item.targetFestivalId),
          name: item.target?.langs.find((lang) => lang?.l?.code === locale)
            ?.name,
          countryName: item.target?.country?.langs.find(
            (lang) => lang?.l?.code === locale
          )?.name,
        };
      }),
      _isGroupsConfirmed: Boolean(
        currentFestival?.festivalsToGroups.length || undefined
      ),
      _groupListSelected: currentFestival?.festivalsToGroups.map((item) => {
        return {
          groupId: String(item.groupId),
          name: item.group?.langs.find((lang) => lang?.l?.code === locale)
            ?.name,
          countryName: item.group?.country?.langs.find(
            (lang) => lang?.l?.code === locale
          )?.name,
        };
      }),
      _isLookingForGroups: Boolean(
        currentFestival?.festivalsGroupToRegions.length
      ),
      _groupRegionSelected: currentFestival?.regionForGroupsId
        ? String(currentFestival?.regionForGroupsId)
        : undefined,
      _groupRegionsSelected:
        currentFestival?.festivalsGroupToRegions
          ?.filter((item) => {
            return regions?.some((comp) => comp.id === item.regionId);
          })
          ?.map((item) => String(item.regionId)) ?? [],
      linkConditions: currentFestival?.linkConditions ?? undefined,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onProcessCoverImages = (
    error: FilePondErrorDescription | null,
    file: FilePondFile
  ) => {
    if (error) {
      console.error(error);

      return;
    }

    setCoverFilesIds([
      ...coverFilesIds,
      { url: file.serverId, name: file.filename },
    ]);
  };

  const onRemoveCoverImages = (
    error: FilePondErrorDescription | null,
    file: FilePondFile
  ) => {
    if (error) {
      console.error(error);

      return;
    }

    setCoverFilesIds(
      coverFilesIds.filter((cover) => cover.url !== file.serverId)
    );
  };

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
    customRevalidatePath("/dashboard/festivals");

    if (result.success) {
      router.push("/dashboard/festivals");
    }
  };

  const { fields: currentDateFields, append: appendCurrentDates, remove:removeCurrentDates } =
    useFieldArray({
      control: form.control,
      name: "_currentDates",
    });

  const {
    fields: nextDateFields,
    append: appendNextDates,
    remove: removeNextDates,
  } = useFieldArray({
    control: form.control,
    name: "_nextDates",
  });

  const {
    fields: transportLocationFields,
    append: appendTransportLocation,
    remove: removeTransportLocation,
  } = useFieldArray({
    control: form.control,
    name: "_transportLocations",
  });

  const {
    fields: festivalListFields,
    append: appendFestivalList,
    remove: removeFestivalList,
  } = useFieldArray({
    control: form.control,
    name: "_festivalListSelected",
  });

  const {
    fields: groupListFields,
    append: appendGroupList,
    remove: removeGroupList,
  } = useFieldArray({
    control: form.control,
    name: "_groupListSelected",
  });

  const currentStatusId = useWatch({
    control: form.control,
    name: "_status",
  });

  const currentCompensation = useWatch({
    control: form.control,
    name: "_typeOfCompensation",
  });

  const currentIsFestivalConnected = useWatch({
    control: form.control,
    name: "_isFestivalsConnected",
  });

  const currentIsLookingForGroups = useWatch({
    control: form.control,
    name: "_isLookingForGroups",
  });

  const currentIsGroupsConfirmed = useWatch({
    control: form.control,
    name: "_isGroupsConfirmed",
  });

  const currentCountrySelected = useWatch({
    control: form.control,
    name: "_countrySelected",
  });

  const currentCountryGroupSelected = useWatch({
    control: form.control,
    name: "_countryGroupSelected",
  });

  const categoriesSelected = useWatch({
    control: form.control,
    name: "_categories",
  });

  useEffect(() => {
    if (currentLang?.id) {
      form.setValue("_lang", {
        ...currentLang,
      });
    }
  }, [currentLang?.id, currentLang, form]);

  type CurrentFestivals = Awaited<ReturnType<typeof buildFestival>>;
  type CurrentGroups = Awaited<ReturnType<typeof buildGroup>>;

  const stateFestivalFetch = useSWR<{ results: CurrentFestivals }>(
    `/api/festival?countryId=${currentCountrySelected ?? ""}`,
    fetcher
  );

  const stateGroupFetch = useSWR<{ results: CurrentGroups }>(
    `/api/group?countryId=${currentCountryGroupSelected ?? ""}`,
    fetcher
  );

  // const categoryOptions = useMemo(
  //   () =>
  //     categoryGroups.map((category) => ({
  //       label: category.title,
  //       value: category.slug,
  //       children: category.categories.length
  //         ? category.categories.map((cat) => ({
  //             label: cat.langs.find((lang) => lang.l?.code === locale)?.name,
  //             value: cat.id.toString(),
  //           }))
  //         : undefined,
  //     })) as TreeNode[],
  //   [categoryGroups, locale]
  // );

  // const selectedCategories:string[] = useMemo(
  //   () =>
  //     currentCategoriesSelected?.map((value) =>                          {
  //       const currentSelectedOption = categoryOptions.find(
  //         (o) =>
  //           o.value === value ||
  //           o.children?.find((option) => option.value === value)
  //       );
  //       const option =
  //         currentSelectedOption?.value === value
  //           ? currentSelectedOption
  //           : currentSelectedOption?.children?.find(
  //               (option) => option.value === value
  //             );

  //       return option?.value ?? "";
  //     }),
  //   [categoryOptions, currentCategoriesSelected]
  // );

  return (
    <APIProvider apiKey={constants.google.apiKey!}>
      <div className="w-full p-4 md:p-6 ">
        <h1 className="text-2xl font-bold">{t("add_an_festival")}</h1>
        <p className="text-sm text-muted-foreground pb-6 after:content-['*'] after:ml-0.5 after:text-red-500">
          {t("the_fields_mandatory")}
        </p>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-6"
          >
            <input
              type="hidden"
              name="countryId"
              value={session?.user?.countryId ?? ""}
            />
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
                  <CardTitle>{t("profile")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="_lang.name"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("name")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isNSAccount}
                              data-dirty={fieldState.isDirty}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("this_is_festival_name")}
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
                            <Input {...field} disabled={isNSAccount} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <div>
                    <Label>State Mode</Label>
                    <RadioGroup
                      defaultValue="offline"
                      name="stateMode"
                      disabled={isNSAccount}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="r1" />
                        <Label htmlFor="r1">Online</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offline" id="r2" />
                        <Label htmlFor="r2">Offline</Label>
                      </div>
                    </RadioGroup>
                  </div> */}
                  <div>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field: { value, ...fieldRest } }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("phone_number")}
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={value as RPNInput.Value}
                              id="phone"
                              placeholder={t("enter_phone_number")}
                              international
                              disabled={isNSAccount}
                              {...fieldRest}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("enter_phone_number")}
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
                            {t("email_address")}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("current_user_this_festival")}
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
                            {t("location")}
                          </FormLabel>
                          <FormControl>
                            <AutocompletePlaces
                              id="location_festival"
                              {...field}
                              defaultPlace={field.value!}
                              disabled={isNSAccount}
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
                            {t("enter_correct_location")}
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
                      render={({ field: { value, ...restField } }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("description")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("year_creation_your_festival")}
                              className="resize-none h-32"
                              {...restField}
                              value={value ?? ""}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("max_500_words_input")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold">
                      {t("current_dates")}
                    </h2>
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
                                  disabled={isNSAccount}
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
                                  <FormLabel>
                                    {t("agenda")} {positionIndex}
                                  </FormLabel>
                                  <FormControl>
                                    <div className="flex gap-4">
                                      <DatePickerWithRange
                                        className="w-full"
                                        buttonClassName="w-full"
                                        disabled={isNSAccount}
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
                                      <Button
                                        variant="ghost"
                                        onClick={() =>
                                          removeCurrentDates(index)
                                        }
                                      >
                                        <Trash className="text-red-500" />
                                      </Button>
                                    </div>
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
                      disabled={isNSAccount}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {t("add_current_Date")}
                    </Button>
                    <input
                      type="hidden"
                      name="_currentDateSize"
                      value={currentDateFields.length}
                    />
                  </div>
                  <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold">{t("next_dates")}</h2>
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
                                  disabled={isNSAccount}
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
                                    {t("next_agenda")} {positionIndex}
                                  </FormLabel>
                                  <FormControl>
                                    <div className="flex gap-4">
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
                                          return (
                                            date < endOfYear(new Date()) ||
                                            isNSAccount
                                          );
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
                                      <Button
                                        variant="ghost"
                                        onClick={() => removeNextDates(index)}
                                      >
                                        <Trash className="text-red-500" />
                                      </Button>
                                    </div>
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
                      disabled={isNSAccount}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {t("add_next_date")}
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
                  <CardTitle>{t("filters")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="_categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("_categories")}</FormLabel>
                        <FormControl>
                          <CategoriesSelect
                            ref={field.ref}
                            disabled={isNSAccount}
                            defaultValue={currentCategoriesSelected ?? []}
                            value={field.value}
                            handleChange={field.onChange}
                            categories={categoryGroups}
                            categoryType="festivals"
                            isLoading={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <input
                    type="hidden"
                    name="groupCategories"
                    value={JSON.stringify(
                      [...removeDuplicates(form.getValues("_categories") ?? [])]
                        .flat()
                        .filter(Boolean) || "[]"
                    )}
                  />
                  {categoriesSelected?.some((categoryId) => {
                    const category = categoryGroups?.find(
                      (cate) => String(cate.id) === categoryId
                    );

                    return [
                      "host-families",
                      "hotel-hostel-campus",
                      "schools-gym-halls",
                    ].includes(category?.slug ?? "");
                  }) ? (
                    <div className="pl-5 border-l">
                      <FormField
                        control={form.control}
                        name="_accomodationPhoto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("upload_a_picture")}</FormLabel>
                            <FormControl>
                              <FilepondImageUploader
                                name={field.name}
                                disabled={isNSAccount}
                                acceptedFileTypes={["image/*"]}
                                defaultFiles={
                                  currentFestival?.accomodationPhoto?.url
                                    ? [
                                        {
                                          source:
                                            currentFestival.accomodationPhoto
                                              ?.url!,
                                          options: {
                                            type: "local",
                                          },
                                        },
                                      ]
                                    : []
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              {t("only_available_for_users")}
                            </FormDescription>
                            <FormMessage />
                            <input
                              name="_accomodationPhotoId"
                              type="hidden"
                              value={
                                currentFestival?.accomodationPhotoId ??
                                undefined
                              }
                            />
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
                          <FormLabel>{t("transport")}</FormLabel>
                          <FormControl>
                            <AutocompletePlaces
                              id="transport_location_festival"
                              {...field}
                              disabled={isNSAccount}
                              onPlaceSelect={(currentPlace) => {
                                setSelectedTransportPlace(currentPlace);
                                appendTransportLocation({
                                  lat: `${currentPlace?.geometry?.location?.lat()}`,
                                  lng: `${currentPlace?.geometry?.location?.lng()}`,
                                  location: currentPlace?.formatted_address,
                                });
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("what_arrival_city")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {transportLocationFields.length ? (
                      <div className="space-y-4 pt-4 mt-2 pl-5 border-l">
                        {transportLocationFields.map((field, index) => {
                          return (
                            <div key={field.id} className="space-y-6">
                              <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-1">
                                  <div className="flex items-center gap-1">
                                    <MapPinIcon size={16} />
                                    <CardTitle className="text-base truncate max-w-[350px]">
                                      {field.location}
                                    </CardTitle>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isNSAccount}
                                    onClick={() =>
                                      void removeTransportLocation(index)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </CardHeader>
                              </Card>
                              <input
                                type="hidden"
                                name={`_transportLocations.${index}.lat`}
                                value={field.lat}
                              />
                              <input
                                type="hidden"
                                name={`_transportLocations.${index}.lng`}
                                value={field.lng}
                              />
                              <input
                                type="hidden"
                                name={`_transportLocations.${index}.location`}
                                value={field.location}
                              />
                            </div>
                          );
                        })}
                        <input
                          type="hidden"
                          name="_transportLocationSize"
                          value={transportLocationFields.length}
                        />
                      </div>
                    ) : null}
                    <div className="rounded-xl">
                      <Map
                        id="transport_location_festival"
                        className="w-full h-[400px] hidden"
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
                              {t("what_languages_transl_speak")}
                            </FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={options}
                                defaultValue={field.value?.split(",")}
                                disabled={isNSAccount}
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
                            {t("other_langu_tran_know_speak")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...restFields}
                              disabled={isNSAccount}
                              value={value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("Include_another_lang_support")}
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
                              {t("How_many_persons_accept_delegation")}
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
                              disabled={isNSAccount}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  <Separator className="bg-gray-200" />
                  <div>
                    <FormField
                      control={form.control}
                      name="_isFestivalsConnected"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>{t("festivals_connected")}</FormLabel>
                            <FormDescription>
                              {t("are_connected_other_fest")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {currentIsFestivalConnected ? (
                    <div className="pl-5 border-l space-y-4">
                      <FormField
                        control={form.control}
                        name="_countrySelected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("select_country")}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isNSAccount}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("Sel_verifiedcount_display")}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries?.map((item) => {
                                  return (
                                    <SelectItem
                                      key={item.id}
                                      value={String(item.id)}
                                    >
                                      {
                                        item.langs.find(
                                          (itemLang) =>
                                            itemLang.l?.code === locale
                                        )?.name
                                      }
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            {/* <FormDescription>
                              You can manage email addresses in your{" "}
                              <Link href="/examples/forms">email settings</Link>
                              .
                            </FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {currentCountrySelected ? (
                        <FormField
                          control={form.control}
                          name="_festivalListSelected"
                          render={({ field }) => {
                            const data =
                              stateFestivalFetch?.data?.results || [];
                            const options: MultiSelectProps["options"] =
                              data?.map((item) => ({
                                value: String(item.id) || "",
                                label:
                                  item.langs.find(
                                    (lang) => lang.l?.code === locale
                                  )?.name || "",
                                caption: "",
                              })) ?? [];
                            return (
                              <FormItem>
                                <FormLabel>{t("select_festivals")}</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={options}
                                    defaultValue={
                                      field.value.map((item) =>
                                        String(item.festivalId)
                                      ) || []
                                    }
                                    disabled={
                                      isNSAccount ||
                                      stateFestivalFetch.isLoading
                                    }
                                    hideSelectedValues
                                    onValueChange={(values) => {
                                      const contents = values.map((item) => {
                                        return {
                                          festivalId: item,
                                          name: data
                                            ?.find(
                                              (value) =>
                                                value.id === Number(item)
                                            )
                                            ?.langs.find(
                                              (lang) => lang?.l?.code === locale
                                            )?.name,
                                          countryName: countries
                                            ?.find(
                                              (country) =>
                                                country.id ===
                                                Number(currentCountrySelected)
                                            )
                                            ?.langs.find(
                                              (lang) => lang?.l?.code === locale
                                            )?.name,
                                        };
                                      });

                                      const deprecateContents =
                                        festivalListFields.filter((item) => {
                                          return !values.some(
                                            (value) => value === item.festivalId
                                          );
                                        });

                                      if (deprecateContents.length) {
                                        const nextDeprecate: number[] = [];
                                        for (const deprecate of deprecateContents) {
                                          const index =
                                            festivalListFields.findIndex(
                                              (item) =>
                                                item.festivalId ===
                                                deprecate.festivalId
                                            );
                                          nextDeprecate.push(index);
                                        }

                                        removeFestivalList(nextDeprecate);
                                      }

                                      const nextContents = contents.filter(
                                        (value) =>
                                          !festivalListFields.some(
                                            (festival) =>
                                              festival.festivalId ===
                                              value.festivalId
                                          )
                                      );
                                      appendFestivalList(nextContents);
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
                      ) : null}
                      {festivalListFields.length ? (
                        <div className="space-y-4">
                          {festivalListFields.map((field, index) => {
                            return (
                              <div key={field.id} className="space-y-6">
                                <Card>
                                  <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-1">
                                    <div>
                                      <CardTitle className="text-base truncate max-w-[350px]">
                                        {field.name}
                                      </CardTitle>
                                      <CardDescription>
                                        {field.countryName}
                                      </CardDescription>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={isNSAccount}
                                      onClick={() =>
                                        void removeFestivalList(index)
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </CardHeader>
                                </Card>
                                <input
                                  type="hidden"
                                  name={`_festivalListSelected.${index}.id`}
                                  value={field.festivalId}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                      <input
                        type="hidden"
                        name="_festivalListSelectedSize"
                        value={festivalListFields.length}
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("media")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="photos">{t("photos")}</Label>
                    <FilepondImageUploader
                      id="photos"
                      name="photos"
                      allowMultiple
                      acceptedFileTypes={["image/*"]}
                      maxFiles={5}
                      disabled={isNSAccount}
                      defaultFiles={
                        currentFestival?.photos.length
                          ? currentFestival.photos.map((item) => {
                              return {
                                source: item.photo?.url!,
                                options: {
                                  type: "local",
                                },
                              };
                            })
                          : []
                      }
                    />
                    <p className="text-sm text-gray-500">
                      {t("max_5_photos_x_each")}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="coverPhotos">{t("cover_photo")}</Label>
                    <FilepondImageUploader
                      id="coverPhotos"
                      name="coverPhotos"
                      allowMultiple
                      maxFiles={3}
                      disabled={isNSAccount}
                      acceptedFileTypes={["image/*"]}
                      onprocessfile={onProcessCoverImages}
                      onremovefile={onRemoveCoverImages}
                      defaultFiles={coverFilesIds.map((photo) => ({
                        source: photo?.url!,
                        options: {
                          type: "local",
                        },
                      }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      {t("imageDimensions")}
                    </p>
                    <input
                      name="coverPhotosId"
                      type="hidden"
                      value={JSON.stringify(coverFilesIds) ?? ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo"> {t("logo")} </Label>
                    <FilepondImageUploader
                      id="logo"
                      name="logo"
                      allowImageCrop
                      disabled={isNSAccount}
                      acceptedFileTypes={["image/*"]}
                      imageCropAspectRatio="1:1"
                      defaultFiles={
                        currentFestival?.logo?.url
                          ? [
                              {
                                source: currentFestival.logo?.url!,
                                options: {
                                  type: "local",
                                },
                              },
                            ]
                          : []
                      }
                    />
                    <p className="text-sm text-gray-500">{t("size_tbc")}</p>
                    <input
                      name="logoId"
                      type="hidden"
                      value={currentFestival?.logoId ?? undefined}
                    />
                  </div>
                  <div>
                    <Label className="text-xl">{t("social_media")}</Label>
                    <div className="space-y-2 mt-3">
                      <Input
                        name="socialId"
                        disabled={isNSAccount}
                        type="hidden"
                        defaultValue={currentFestival?.social?.id || 0}
                      />
                      <div>
                        <Label htmlFor="youtubeId">{t("youtube")}</Label>
                        <Input
                          id="youtubeId"
                          name="youtubeId"
                          placeholder="https://www.youtube.com"
                          defaultValue={currentFestival?.youtubeId ?? undefined}
                          disabled={isNSAccount}
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          name="facebook"
                          placeholder="https://www.facebook.com"
                          defaultValue={
                            currentFestival?.social?.facebookLink || undefined
                          }
                          disabled={isNSAccount}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          name="instagram"
                          placeholder="https://www.instagram.com"
                          defaultValue={
                            currentFestival?.social?.instagramLink || undefined
                          }
                          disabled={isNSAccount}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">{t("website_link")}</Label>
                        <Input
                          name="website"
                          placeholder="https://www.google.com"
                          defaultValue={
                            currentFestival?.social?.websiteLink || undefined
                          }
                          disabled={isNSAccount}
                        />
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-6">
                      {t("media_description")}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("additional_information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="linkConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("link_conditions_Applica")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder={t("provide_URL_conditions")}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("Link_document_conditions_procedure")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="stagePhotos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pictures_your_stages")}</FormLabel>
                          <FormControl>
                            <FilepondImageUploader
                              id="stagePhotos"
                              name={field.name}
                              allowMultiple
                              acceptedFileTypes={["image/*"]}
                              maxFiles={5}
                              disabled={isNSAccount}
                              defaultFiles={
                                currentFestival?.stagePhotos.length
                                  ? currentFestival.stagePhotos.map((item) => {
                                      return {
                                        source: item.photo?.url!,
                                        options: {
                                          type: "local",
                                        },
                                      };
                                    })
                                  : []
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {t("max_5_photos_min_600_600")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="_isGroupsConfirmed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>{t("groups_confirmed")}</FormLabel>
                            <FormDescription>
                              {t("do_you_have_CIOFF_confirmed")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {currentIsGroupsConfirmed ? (
                    <div className="pl-5 border-l space-y-4">
                      <FormField
                        control={form.control}
                        name="_countryGroupSelected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("select_country")}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isNSAccount}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("Sel_verifiedcount_display")}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries?.map((item) => {
                                  return (
                                    <SelectItem
                                      key={item.id}
                                      value={String(item.id)}
                                    >
                                      {
                                        item.langs.find(
                                          (itemLang) =>
                                            itemLang.l?.code === locale
                                        )?.name
                                      }
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {currentCountryGroupSelected ? (
                        <FormField
                          control={form.control}
                          name="_groupListSelected"
                          render={({ field }) => {
                            const data = stateGroupFetch?.data?.results || [];
                            const options: MultiSelectProps["options"] =
                              data?.map((item) => ({
                                value: String(item.id) || "",
                                label:
                                  item.langs.find(
                                    (lang) => lang.l?.code === locale
                                  )?.name ||
                                  item.langs.at(0)?.name ||
                                  "",
                                caption: "",
                              })) ?? [];
                            return (
                              <FormItem>
                                <FormLabel>{t("select_groups")}</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={options}
                                    defaultValue={
                                      field.value.map((item) =>
                                        String(item.groupId)
                                      ) || []
                                    }
                                    disabled={
                                      isNSAccount || stateGroupFetch.isLoading
                                    }
                                    hideSelectedValues
                                    onValueChange={(values) => {
                                      const contents = values.map((item) => {
                                        return {
                                          groupId: item,
                                          name: data
                                            ?.find(
                                              (value) =>
                                                value.id === Number(item)
                                            )
                                            ?.langs.find(
                                              (lang) => lang?.l?.code === locale
                                            )?.name,
                                          countryName: countries
                                            ?.find(
                                              (country) =>
                                                country.id ===
                                                Number(
                                                  currentCountryGroupSelected
                                                )
                                            )
                                            ?.langs.find(
                                              (lang) => lang?.l?.code === locale
                                            )?.name,
                                        };
                                      });

                                      const deprecateContents =
                                        groupListFields.filter((item) => {
                                          return !values.some(
                                            (value) => value === item.groupId
                                          );
                                        });

                                      if (deprecateContents.length) {
                                        const nextDeprecate: number[] = [];
                                        for (const deprecate of deprecateContents) {
                                          const index =
                                            groupListFields.findIndex(
                                              (item) =>
                                                item.groupId ===
                                                deprecate.groupId
                                            );
                                          nextDeprecate.push(index);
                                        }

                                        removeGroupList(nextDeprecate);
                                      }

                                      const nextContents = contents.filter(
                                        (value) =>
                                          !groupListFields.some(
                                            (festival) =>
                                              festival.groupId === value.groupId
                                          )
                                      );
                                      appendGroupList(nextContents);
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
                      ) : null}
                      {groupListFields.length ? (
                        <div className="space-y-4">
                          {groupListFields.map((field, index) => {
                            return (
                              <div key={field.id} className="space-y-6">
                                <Card>
                                  <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-1">
                                    <div>
                                      <CardTitle className="text-base truncate max-w-[550px]">
                                        {field.name}
                                      </CardTitle>
                                      <CardDescription>
                                        {field.countryName}
                                      </CardDescription>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        void removeGroupList(index)
                                      }
                                      disabled={isNSAccount}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </CardHeader>
                                </Card>
                                <input
                                  type="hidden"
                                  name={`_groupListSelected.${index}.id`}
                                  value={field.groupId}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                      <input
                        type="hidden"
                        name="_groupListSelectedSize"
                        value={groupListFields.length}
                      />
                    </div>
                  ) : null}
                  <div>
                    <FormField
                      control={form.control}
                      name="_isLookingForGroups"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>{t("search_groups")}</FormLabel>
                            <FormDescription>
                              {t("are_looking_groups")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              disabled={isNSAccount}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {currentIsLookingForGroups ? (
                    <div className="pl-5 border-l space-y-4">
                      <FormField
                        control={form.control}
                        name="_groupRegionsSelected"
                        render={({ field }) => {
                          const options: MultiSelectProps["options"] =
                            regions?.map((item) => ({
                              value: String(item.id) || "",
                              label:
                                item.langs.find(
                                  (lang) => lang?.l?.code === locale
                                )?.name ?? "",
                              caption: "",
                            })) ?? [];
                          return (
                            <FormItem>
                              <FormLabel>{t("select_regions")}</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  options={options}
                                  defaultValue={field.value}
                                  disabled={isNSAccount}
                                  onValueChange={(values) => {
                                    field.onChange(values);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                {t("this_region_help_groups_region")}
                              </FormDescription>
                              <FormMessage />
                              <input
                                type="hidden"
                                name="_groupRegions"
                                value={JSON.stringify(field.value ?? [])}
                              />
                            </FormItem>
                          );
                        }}
                      />
                      {/* <FormField */}
                      {/*   control={form.control} */}
                      {/*   name="_groupRegionSelected" */}
                      {/*   render={({ field }) => ( */}
                      {/*     <FormItem> */}
                      {/*       <FormLabel>Select a Region</FormLabel> */}
                      {/*       <Select */}
                      {/*         onValueChange={field.onChange} */}
                      {/*         defaultValue={field.value} */}
                      {/*         name={field.name} */}
                      {/*         disabled={isNSAccount} */}
                      {/*       > */}
                      {/*         <FormControl> */}
                      {/*           <SelectTrigger> */}
                      {/*             <SelectValue placeholder="Select a verified region to display" /> */}
                      {/*           </SelectTrigger> */}
                      {/*         </FormControl> */}
                      {/*         <SelectContent> */}
                      {/*           {regions?.map((region) => { */}
                      {/*             return ( */}
                      {/*               <SelectItem */}
                      {/*                 key={`group-region-${region.id}`} */}
                      {/*                 value={String(region.id)} */}
                      {/*               > */}
                      {/*                 { */}
                      {/*                   region.langs.find( */}
                      {/*                     (lang) => lang?.l?.code === locale, */}
                      {/*                   )?.name */}
                      {/*                 } */}
                      {/*               </SelectItem> */}
                      {/*             ); */}
                      {/*           })} */}
                      {/*         </SelectContent> */}
                      {/*       </Select> */}
                      {/*       <FormDescription> */}
                      {/*         This region will help you for groups of interest on */}
                      {/*         selected region. */}
                      {/*       </FormDescription> */}
                      {/*       <FormMessage /> */}
                      {/*     </FormItem> */}
                      {/*   )} */}
                      {/* /> */}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
            <Card className={cn("hidden")}>
              <CardHeader>
                <CardTitle>Recognition Certification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recognitionCertificate">
                    Upload recognition certificate
                  </Label>
                  <FilepondImageUploader
                    id="recognitionCertificate"
                    name="recognitionCertificate"
                    acceptedFileTypes={["application/pdf"]}
                    defaultFiles={
                      currentFestival?.certification?.url
                        ? [
                            {
                              source: currentFestival.certification?.url!,
                              options: {
                                type: "local",
                              },
                            },
                          ]
                        : []
                    }
                  />
                </div>
                <input
                  name="recognitionCertificateId"
                  type="hidden"
                  value={currentFestival?.certificationMemberId ?? undefined}
                />
              </CardContent>
            </Card>

            {!isNSAccount ? (
              <div className="sticky bottom-5 right-0 flex justify-end px-4">
                <Card className="flex justify-end gap-4 w-full">
                  <CardContent className="flex-row items-center p-4 flex w-full justify-between">
                    <div className="flex-1">
                      {/* <Label className="text-sm font-medium flex items-center gap-1">
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
                      /> */}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" asChild>
                        <Link href="/dashboard/festivals">{t("cancel")}</Link>
                      </Button>
                      <Submit label={t("save")} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </form>
        </Form>
      </div>
    </APIProvider>
  );
}
