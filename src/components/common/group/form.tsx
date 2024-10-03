"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
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
import { createGroup } from "@/app/actions";
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
import {
  insertFestivalSchema,
  insertGroupLangSchema,
  insertGroupSchema,
  SelectGroup,
} from "@/db/schema";
import { AutocompletePlaces } from "@/components/ui/autocomplete-places";
import MapHandler from "@/components/common/map-handler";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatBytes } from "@/lib/utils";
import { PlusCircle, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addYears, endOfYear, format, startOfYear, subYears } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GroupDetailsType } from "@/db/queries/groups";
import { Cross2Icon, FileTextIcon } from "@radix-ui/react-icons";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";

const globalGroupSchema = insertGroupSchema.extend({
  _lang: insertGroupLangSchema,
  _typeOfGroup: z.string(),
  _groupAge: z.string(),
  _generalDirectorPhoto: z
    .any()
    .refine((item) => item instanceof File || typeof item === "undefined", {
      params: { i18n: "file_required" },
    }),
  _artisticDirectorPhoto: z
    .any()
    .refine((item) => item instanceof File || typeof item === "undefined", {
      params: { i18n: "file_required" },
    }),
  _musicalDirectorPhoto: z
    .any()
    .refine((item) => item instanceof File || typeof item === "undefined", {
      params: { i18n: "file_required" },
    }),
});

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith("image/")) {
    return (
      <Image
        src={file.preview}
        alt={file.name}
        width={48}
        height={48}
        loading="lazy"
        className="aspect-square shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <FileTextIcon
      className="size-10 text-muted-foreground"
      aria-hidden="true"
    />
  );
}

interface FileCardProps {
  file: File;
  onRemove?: () => void;
  progress?: number;
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={onRemove}
        >
          <Cross2Icon className="size-4" aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
}

function getExtensionFromMimeType(mimeType: string) {
  const mimeToExtension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/svg+xml": "svg",
    "image/webp": "webp",
    // Add more MIME types and their extensions as needed
  };

  return mimeToExtension[mimeType as keyof typeof mimeToExtension] || "";
}

const urlToFile = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();

  // Get the filename from Content-Disposition
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = contentDisposition?.match(/filename="([^"]+)/)?.[1];

  if (!fileName) {
    fileName = "image." + getExtensionFromMimeType(blob.type);
  }

  const file = new File([blob], fileName, { type: blob.type });

  return file;
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

interface RepertoireItem {
  id: number;
  name: string;
  description: string;
  photos: FileList | null;
  video: string;
}

export default function GroupForm({
  currentGroup,
  id,
}: {
  currentGroup?: GroupDetailsType | undefined;
  id?: string;
}) {
  // const [state, formAction] = useFormState(createGroup, undefined);
  const [groupType, setGroupType] = useState<string>("only_dance");
  const [travelAvailability, setTravelAvailability] = useState<string>("no");
  const [repertoire, setRepertoire] = useState<RepertoireItem[]>([
    { id: 1, name: "", description: "", photos: null, video: "" },
  ]);
  const directorPhotoUrl = useRef(currentGroup?.directorPhoto?.url);
  const [currentFile, setCurrentFile] = useState<
    (File & { preview: string }) | null
  >(null);
  const [selectedTypeOfGroup, setSelectedTypeOfGroup] = useState<string[]>([]);
  const [selectedGroupAge, setSelectedGroupAge] = useState<string[]>([]);

  useEffect(() => {
    if (directorPhotoUrl.current) {
      urlToFile(directorPhotoUrl.current).then((response) => {
        const data = response as File & { preview: string };
        data.preview = URL.createObjectURL(response);
        setCurrentFile(data);
      });
    }
  }, []);

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

  const form = useForm<z.infer<typeof globalGroupSchema>>({
    resolver: zodResolver(globalGroupSchema),
    defaultValues: {
      generalDirectorName: "",
      artisticDirectorName: "",
      _lang: {
        name: "",
        generalDirectorProfile: "",
        artisticDirectorProfile: "",
      },
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitForm: SubmitHandler<z.infer<typeof globalGroupSchema>> = async (
    _data
  ) => {
    // const result = await updateNationalSection(new FormData(formRef.current!));
    // if (result.success) {
    //   toast.success(result.success);
    // } else if (result.error) {
    //   toast.error(result.error);
    // }
    // customRevalidatePath(`/dashboard/national-sections/${slug}/edit`);
    // customRevalidatePath("/dashboard/national-sections");
    // if (result.success) {
    //   router.push("/dashboard/national-sections");
    // }
  };

  return (
    <div className="w-full p-4 md:p-6 ">
      <h1 className="text-2xl font-bold">ADD A GROUP</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
      </p>
      <Form {...form}>
        <form
          noValidate
          ref={formRef}
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmitForm)}
        >
          {id && <input type="hidden" name="_id" value={id} />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module 1: Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"_lang.name"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Name of the group
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>
                          Filled automatically from the list provided by NS
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"generalDirectorName"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          General Director name
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"_lang.generalDirectorProfile"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          General Director profile
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none"
                            placeholder="Write a short description of your main achievements,
                            studies, etc"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value || ""}
                            onBlur={field.onBlur}
                            ref={field.ref}
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
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"artisticDirectorName"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Artistic Director name
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"_lang.artisticDirectorProfile"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Artistic Director profile
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none"
                            placeholder="Write a short description of your main achievements,
                            studies, etc"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value || ""}
                            onBlur={field.onBlur}
                            ref={field.ref}
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
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"_artisticDirectorPhoto"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Artistic Director's photo
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            type="file"
                            accept="image/*"
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field: { value, ...fieldRest } }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Phone (country code)
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
                        <FormDescription>Enter a phone number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" name="email" />
                  {/* <FormField
                    control={form.control}
                    name={"email"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your current email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="_typeOfGroup"
                    render={({ field }) => {
                      const options: MultiSelectProps["options"] = [
                        {
                          value: "dance",
                          label: "Only dance",
                          caption: "",
                        },
                        {
                          value: "music",
                          label: "Only music",
                          caption: "",
                        },
                      ];

                      return (
                        <FormItem>
                          <FormLabel>Type of group</FormLabel>
                          <FormControl>
                            <MultiSelect
                              ref={field.ref}
                              options={options}
                              onValueChange={(values) => {
                                setSelectedTypeOfGroup(values);
                                form.setValue(
                                  "_typeOfGroup",
                                  JSON.stringify(values)
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <input
                    type="hidden"
                    name="_typeOfGroup"
                    value={JSON.stringify(selectedTypeOfGroup) || "[]"}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="isAbleTravelLiveMusic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>
                            Are you able to travel with live music?
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value!}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"_lang.description"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Short description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value || ""}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>Max 500 words</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="_groupAge"
                    render={({ field }) => {
                      const options: MultiSelectProps["options"] = [
                        {
                          value: "seniors",
                          label: "Seniors",
                          caption: "",
                        },
                        {
                          value: "youth-adults",
                          label: "Youth / Adults",
                          caption: "",
                        },
                        {
                          value: "teenagers",
                          label: "Teenagers",
                          caption: "",
                        },
                        {
                          value: "children",
                          label: "Children",
                          caption: "",
                        },
                      ];

                      return (
                        <FormItem>
                          <FormLabel>Group age</FormLabel>
                          <FormControl>
                            <MultiSelect
                              ref={field.ref}
                              options={options}
                              onValueChange={(values) => {
                                setSelectedGroupAge(values);
                                form.setValue(
                                  "_groupAge",
                                  JSON.stringify(values)
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <input
                    type="hidden"
                    name="_groupAge"
                    value={JSON.stringify(selectedGroupAge) || "[]"}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"membersNumber"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Number of members
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            type="number"
                            max="40"
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>
                          Write number of members
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    <Link href="/dashboard/national-sections">Cancel</Link>
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
