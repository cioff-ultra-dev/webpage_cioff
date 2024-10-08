"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
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
import { Button, ButtonProps } from "@/components/ui/button";
import { updateGroup } from "@/app/actions";
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
  insertGroupLangSchema,
  insertGroupSchema,
  insertSubGroupLangSchema,
  insertSubGroupSchema,
} from "@/db/schema";
import { cn, formatBytes } from "@/lib/utils";
import { X } from "lucide-react";
import {
  AgeGroupsType,
  GroupDetailsType,
  GroupStyleType,
  TypeOfGroupType,
} from "@/db/queries/groups";
import { Cross2Icon, FileTextIcon } from "@radix-ui/react-icons";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { useTranslations } from "next-intl";
import { DatePickerWithRange } from "@/components/ui/datepicker-with-range";
import { Session } from "next-auth";
import { toast } from "sonner";
import { customRevalidatePath } from "../revalidateTag";
import { useRouter } from "next/navigation";
import { RegionsType } from "@/db/queries/regions";

const globalGroupSchema = insertGroupSchema.extend({
  _lang: insertGroupLangSchema,
  _typeOfGroup: z.array(z.string()),
  _groupAge: z.array(z.string()),
  _styleOfGroup: z.array(z.string()),
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
  // _musicalDirectorPhoto: z
  //   .any()
  //   .refine((item) => item instanceof File || typeof item === "undefined", {
  //     params: { i18n: "file_required" },
  //   }),
  _isAbleToTravel: z.boolean().optional(),
  _isAbleToTravelToLiveMusic: z.boolean().optional(),
  _specificDate: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  _specificRegion: z.string().optional(),
  _subgroups: z.array(
    insertSubGroupSchema.extend({
      _lang: insertSubGroupLangSchema,
    }),
  ),
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
  typeOfGroups,
  ageGroups,
  groupStyles,
  session,
  locale,
  currentLang,
  currentCategoriesSelected,
  regions,
}: {
  currentGroup?: GroupDetailsType | undefined;
  id?: string;
  typeOfGroups: TypeOfGroupType;
  ageGroups: AgeGroupsType;
  groupStyles: GroupStyleType;
  currentLang?: NonNullable<GroupDetailsType>["langs"][number];
  session?: Session;
  locale?: string;
  currentCategoriesSelected?: string[];
  regions?: RegionsType;
}) {
  useI18nZodErrors("group");
  const isNSAccount = session?.user.role?.name === "National Sections";

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
  const [selectedStyleOfGroup, setSelectedStyleOfGroup] = useState<string[]>(
    [],
  );

  const t = useTranslations("form.group");
  const router = useRouter();

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
    value: string | FileList | null,
  ) => {
    setRepertoire(
      repertoire.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const form = useForm<z.infer<typeof globalGroupSchema>>({
    resolver: zodResolver(globalGroupSchema),
    defaultValues: {
      id: currentGroup?.id ?? 0,
      generalDirectorName: currentGroup?.generalDirectorName || "",
      artisticDirectorName: currentGroup?.artisticDirectorName || "",
      phone: currentGroup?.phone || "",
      _groupAge: currentCategoriesSelected?.filter((item) => {
        return ageGroups.some((category) => category.id === Number(item));
      }),
      _typeOfGroup: currentCategoriesSelected?.filter((item) => {
        return typeOfGroups.some((category) => category.id === Number(item));
      }),
      _styleOfGroup: currentCategoriesSelected?.filter((item) => {
        return groupStyles.some((category) => category.id === Number(item));
      }),
      membersNumber: currentGroup?.membersNumber,
      _specificRegion: currentGroup?.specificRegion
        ? String(currentGroup?.specificRegion)
        : undefined,
      _isAbleToTravel: currentGroup?.isAbleTravel ?? false,
      _isAbleToTravelToLiveMusic: currentGroup?.isAbleTravelLiveMusic ?? false,
      _specificDate: {
        from: currentGroup?.specificTravelDateFrom?.toUTCString() ?? "",
        to: currentGroup?.specificTravelDateTo?.toUTCString() ?? "",
      },
      _lang: {
        id: currentLang?.id ?? 0,
        name: currentLang?.name || "",
        address: currentLang?.address || undefined,
        description: currentLang?.description || undefined,
        generalDirectorProfile: currentLang?.generalDirectorProfile || "",
        artisticDirectorProfile: currentLang?.artisticDirectorProfile || "",
      },
    },
  });

  const { fields: subGroupFields, append: appendSubGroupEvent } = useFieldArray(
    {
      control: form.control,
      name: "_subgroups",
    },
  );

  const isAbleToTravelWatch = useWatch({
    control: form.control,
    name: "_isAbleToTravel",
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitForm: SubmitHandler<z.infer<typeof globalGroupSchema>> = async (
    _data,
  ) => {
    const result = await updateGroup(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    // if (result.success) {
    //   customRevalidatePath("/dashboard/groups");
    //   router.push("/dashboard/groups");
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
          ref={formRef}
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmitForm)}
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
                <CardTitle>Group Information</CardTitle>
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
                            disabled={isNSAccount}
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
                          President/General Director name
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                            disabled={isNSAccount}
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
                          President/General Director profile
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
                            disabled={isNSAccount}
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
                    name={"_generalDirectorPhoto"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          President/General Director's photo
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              field.onChange(
                                event.target.files && event.target.files[0],
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            disabled={isNSAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Artist Director */}
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
                            disabled={isNSAccount}
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
                            disabled={isNSAccount}
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
                            onChange={(event) => {
                              field.onChange(
                                event.target.files && event.target.files[0],
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            disabled={isNSAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Musical Director */}
                {/* <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={"musicalDirectorName"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Musical Director name
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                            disabled={isNSAccount}
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
                    name={"_lang.musicalDirectorProfile"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Musical Director profile
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
                            disabled={isNSAccount}
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
                    name={"_musicalDirectorPhoto"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Musical Director's photo
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            type="file"
                            accept="image/*"
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            disabled={isNSAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}

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
                            disabled={isNSAccount}
                          />
                        </FormControl>
                        <FormDescription>Enter a phone number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="_lang.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Mail Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                            disabled={isNSAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      const options: MultiSelectProps["options"] =
                        typeOfGroups.map((type) => {
                          const label = type.langs?.[0]?.name;
                          return {
                            label: label,
                            value: String(type.id),
                            caption: "",
                          };
                        });

                      return (
                        <FormItem>
                          <FormLabel>Type of group</FormLabel>
                          <FormControl>
                            <MultiSelect
                              ref={field.ref}
                              options={options}
                              disabled={isNSAccount}
                              value={field.value as string[]}
                              defaultValue={
                                (field.value as string[])?.filter((item) =>
                                  options.find(
                                    (option) => option.value === item,
                                  ),
                                ) ?? []
                              }
                              onValueChange={(values) => {
                                setSelectedGroupAge(values);
                                field.onChange(values);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            type="hidden"
                            name="_typeOfGroup"
                            value={JSON.stringify(field.value) || "[]"}
                          />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="_isAbleToTravelToLiveMusic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>
                            Are you able to travel with live music?
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            name={field.name}
                            checked={field.value!}
                            onCheckedChange={field.onChange}
                            disabled={isNSAccount}
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
                            disabled={isNSAccount}
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
                      const options: MultiSelectProps["options"] =
                        ageGroups.map((type) => {
                          const label = type.langs?.[0]?.name;
                          return {
                            label: label,
                            value: String(type.id),
                            caption: "",
                          };
                        });

                      return (
                        <FormItem>
                          <FormLabel>Group age</FormLabel>
                          <FormControl>
                            <MultiSelect
                              ref={field.ref}
                              options={options}
                              disabled={isNSAccount}
                              value={field.value as string[]}
                              defaultValue={
                                (field.value as string[])?.filter((item) =>
                                  options.find(
                                    (option) => option.value === item,
                                  ),
                                ) ?? []
                              }
                              onValueChange={(values) => {
                                setSelectedGroupAge(values);
                                field.onChange(values);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            type="hidden"
                            name="_groupAge"
                            value={JSON.stringify(field.value) || "[]"}
                          />
                        </FormItem>
                      );
                    }}
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
                            onChange={(event) => {
                              field.onChange(
                                event.target.value
                                  ? Number(event.target.value)
                                  : 0,
                              );
                            }}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                            disabled={isNSAccount}
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
                  <FormField
                    control={form.control}
                    name="_styleOfGroup"
                    render={({ field }) => {
                      const options: MultiSelectProps["options"] =
                        groupStyles.map((type) => {
                          const label = type.langs?.[0]?.name;
                          return {
                            label: label,
                            value: String(type.id),
                            caption: "",
                          };
                        });

                      return (
                        <FormItem>
                          <FormLabel>Style of group</FormLabel>
                          <FormControl>
                            <MultiSelect
                              ref={field.ref}
                              options={options}
                              disabled={isNSAccount}
                              value={field.value as string[]}
                              defaultValue={
                                (field.value as string[])?.filter((item) =>
                                  options.find(
                                    (option) => option.value === item,
                                  ),
                                ) ?? []
                              }
                              onValueChange={(values) => {
                                setSelectedGroupAge(values);
                                field.onChange(values);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            type="hidden"
                            name="_styleOfGroup"
                            value={JSON.stringify(field.value) || "[]"}
                          />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* <div className="space-y-4 border-t pt-4">
                  <h2 className="text-lg font-semibold">Sub Groups</h2>
                  {subGroupFields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="grid w-full items-center pt-6 gap-1.5"
                    >
                      <FormField
                        control={form.control}
                        name={`_subgroups.${index}.id`}
                        disabled={isNSAccount}
                        render={({ field }) => (
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
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`_subgroups.${index}._lang.id`}
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              ref={field.ref}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              value={field.value}
                              name={field.name}
                              type="hidden"
                              disabled={isNSAccount}
                            />
                          </FormControl>
                        )}
                      />
                      <CardContent className=" flex items-center flex-col gap-5">
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            control={form.control}
                            name={`_subgroups.${index}._lang.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                  Name of the sub group
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    ref={field.ref}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    value={field.value ?? ""}
                                    name={field.name}
                                    disabled={isNSAccount}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter your current sub group name
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            control={form.control}
                            name={`_subgroups.${index}.membersNumber`}
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
                                    disabled={isNSAccount}
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
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            control={form.control}
                            name="_groupAge"
                            render={({ field }) => {
                              const options: MultiSelectProps["options"] =
                                ageGroups.map((type) => {
                                  const label = type.langs?.[0]?.name;
                                  return {
                                    label: label,
                                    value: String(type.id),
                                    caption: "",
                                  };
                                });

                              return (
                                <FormItem>
                                  <FormLabel>Group age</FormLabel>
                                  <FormControl>
                                    <MultiSelect
                                      ref={field.ref}
                                      options={options}
                                      disabled={isNSAccount}
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
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    disabled={isNSAccount}
                    onClick={(_) =>
                      appendSubGroupEvent({
                        _lang: {},
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Travel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="_isAbleToTravel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Are you available for travelling this year?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value === "yes");
                            }}
                            defaultValue={field.value ? "yes" : "no"}
                            className="flex flex-col space-y-1"
                            name={field.name}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {isAbleToTravelWatch && (
                  <>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`_specificDate`}
                        render={({ field: { value, onChange } }) => (
                          <FormItem>
                            <FormLabel>
                              Any specific date? (calendar option)
                            </FormLabel>
                            <FormControl>
                              <>
                                <DatePickerWithRange
                                  className="w-full"
                                  buttonClassName="w-full"
                                  disabled={isNSAccount}
                                  defaultDates={{
                                    from: form.getValues(`_specificDate.from`)
                                      ? new Date(
                                          form.getValues(
                                            `_specificDate.from`,
                                          ) ?? "",
                                        )
                                      : undefined,
                                    to:
                                      form.getValues(`_specificDate.to`) &&
                                      form.getValues(`_specificDate.from`) !==
                                        form.getValues(`_specificDate.to`)
                                        ? new Date(
                                            form.getValues(`_specificDate.to`)!,
                                          )
                                        : undefined,
                                  }}
                                  onValueChange={(rangeValue) => {
                                    onChange({
                                      from: rangeValue?.from?.toUTCString(),
                                      to: rangeValue?.to?.toUTCString() ?? "",
                                    });
                                  }}
                                />
                                <input
                                  type="hidden"
                                  name={`_specificDate.from`}
                                  value={value?.from}
                                />
                                <input
                                  type="hidden"
                                  name={`_specificDate.to`}
                                  value={value?.to}
                                />
                              </>
                            </FormControl>
                            {form?.getFieldState(`_specificDate.from`).error
                              ?.message ? (
                              <p
                                className={cn(
                                  "text-sm font-medium text-destructive",
                                )}
                              >
                                {
                                  form?.getFieldState(`_specificDate.from`)
                                    .error?.message
                                }
                              </p>
                            ) : null}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="_specificRegion"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Any specific region?</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                disabled={isNSAccount}
                                defaultValue={
                                  field.value ? `${field.value}` : undefined
                                }
                                name={field.name}
                              >
                                <FormControl>
                                  <SelectTrigger className="font-medium data-[placeholder]:text-muted-foreground">
                                    <SelectValue placeholder="Select a region" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {regions?.map((region) => {
                                    return (
                                      <SelectItem
                                        key={`region-${region.id}`}
                                        value={String(region.id)}
                                      >
                                        {
                                          region.langs.find(
                                            (lang) => lang.l?.code === locale,
                                          )?.name
                                        }
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
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
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isNSAccount}
                  />
                  <p className="text-sm text-muted-foreground">
                    Max 5 photos x 3MB each
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverPhoto">Cover photo</Label>
                  <Input
                    id="coverPhoto"
                    type="file"
                    accept="image/*"
                    disabled={isNSAccount}
                  />
                  <p className="text-sm text-muted-foreground">Size TBC</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    disabled={isNSAccount}
                  />
                  <p className="text-sm text-muted-foreground">Size TBC</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">Video</Label>
                  <Input
                    id="video"
                    name="youtube"
                    placeholder="YouTube Link"
                    defaultValue={currentGroup?.youtubeId ?? undefined}
                    disabled={isNSAccount}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook link</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    type="url"
                    defaultValue={currentGroup?.facebookLink ?? undefined}
                    disabled={isNSAccount}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Link</Label>
                  <Input
                    id="instagram"
                    type="url"
                    name="instagram"
                    defaultValue={currentGroup?.instagramLink ?? undefined}
                    disabled={isNSAccount}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website link</Label>
                  <Input
                    id="website"
                    type="url"
                    name="website"
                    defaultValue={currentGroup?.websiteLink ?? undefined}
                    disabled={isNSAccount}
                  />
                </div>
              </CardContent>
            </Card>
            {/* <Card>
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
            </Card> */}

            {/* <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupPortfolio">
                    Upload group portfolio/brochure
                  </Label>
                  <Input
                    id="groupPortfolio"
                    type="file"
                    accept=".pdf"
                    disabled={isNSAccount}
                  />
                  <p className="text-sm text-muted-foreground">
                    Only PDF - max 10MB
                  </p>
                </div>
              </CardContent>
            </Card> */}
          </div>
          {!isNSAccount ? (
            <div className="sticky bottom-5 mt-4 right-0 flex justify-end px-4">
              <Card className="flex justify-end gap-4 w-full">
                <CardContent className="flex-row items-center p-4 flex w-full justify-end">
                  <div className="flex gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/dashboard/national-sections">Cancel</Link>
                    </Button>
                    <Submit
                      label="Save"
                      isLoading={form.formState.isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </form>
      </Form>
    </div>
  );
}
