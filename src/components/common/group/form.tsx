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
  insertRepertoryLangSchema,
  insertRepertorySchema,
  insertSubGroupLangSchema,
  insertSubGroupSchema,
} from "@/db/schema";
import { cn, formatBytes } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { GroupDetailsType } from "@/db/queries/groups";
import { Cross2Icon, FileTextIcon } from "@radix-ui/react-icons";
import { Switch } from "@/components/ui/switch";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { useTranslations } from "next-intl";
import { DatePickerWithRange } from "@/components/ui/datepicker-with-range";
import { Session } from "next-auth";
import { toast } from "sonner";
import { customRevalidatePath } from "../revalidateTag";
import { useRouter } from "next/navigation";
import { RegionsType } from "@/db/queries/regions";
import { FilepondImageUploader } from "@/components/extension/filepond-image-uploader";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { AutocompletePlaces } from "@/components/ui/autocomplete-places";
import MapHandler from "@/components/common/map-handler";
import constants from "@/constants";
import { FilePondErrorDescription, FilePondFile } from "filepond";
import { CategoriesType } from "@/db/queries/categories";
import { CategoriesSelect } from "../categories-select";

const globalGroupSchema = insertGroupSchema.extend({
  _categories: z.array(z.string()).nonempty(),
  _lang: insertGroupLangSchema,
  _typeOfGroup: z.array(z.string()).optional(),
  _groupAge: z.array(z.string()).optional(),
  _styleOfGroup: z.array(z.string()).optional(),
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
      _groupAge: z.array(z.string()),
      _hasAnotherContact: z.boolean().default(false).optional(),
    })
  ),
  _repertories: z.array(
    insertRepertorySchema.extend({
      _lang: insertRepertoryLangSchema,
    })
  ),
});

interface FilePreviewProps {
  file: File & { preview: string };
}

function removeDuplicates(data: string[]) {
  return Array.from(new Set(Array.from(data)));
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
  session,
  locale,
  currentLang,
  currentCategoriesSelected,
  regions,
  categories,
}: {
  categories: CategoriesType;
  currentGroup?: GroupDetailsType | undefined;
  id?: string;
  currentLang?: NonNullable<GroupDetailsType>["langs"][number];
  session?: Session;
  locale?: string;
  currentCategoriesSelected?: string[];
  regions?: RegionsType;
}) {
  useI18nZodErrors("group");
  const isNSAccount = session?.user.role?.name === "National Sections";
  const isFestivalAccount = session?.user.role?.name === "Festivals";
  const isCurrentOwner = currentGroup?.owners.some(
    (item) => item.userId === session?.user.id
  );
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [coverFilesIds, setCoverFilesIds] = React.useState<
    { url: string; name: string }[]
  >(
    () =>
      currentGroup?.coverPhotos?.map((cover) => ({
        url: cover.photo?.url ?? "",
        name: cover.photo?.name ?? "",
      })) ?? []
  );

  const t = useTranslations("form.group");
  const router = useRouter();

  const form = useForm<z.infer<typeof globalGroupSchema>>({
    resolver: zodResolver(globalGroupSchema),
    defaultValues: {
      _categories: currentCategoriesSelected,
      id: currentGroup?.id ?? 0,
      generalDirectorName: currentGroup?.generalDirectorName || "",
      artisticDirectorName: currentGroup?.artisticDirectorName || "",
      musicalDirectorName: currentGroup?.musicalDirectorName || "",
      phone: currentGroup?.phone || "",
      _groupAge: undefined,
      _typeOfGroup: undefined,
      _styleOfGroup: undefined,
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
        musicalDirectorProfile: currentLang?.musicalDirectorProfile || "",
      },
      _subgroups: currentGroup?.subgroups.map((item) => {
        return {
          id: item.id,
          _hasAnotherContact: item.hasAnotherContact ?? false,
          contactName: item.contactName,
          contactPhone: item.contactPhone,
          contactMail: item.contactMail,
          membersNumber: item.membersNumber,
          _groupAge:
            item.subgroupsToCategories.map((item) => String(item.categoryId)) ??
            [],
          _lang: {
            id: item.langs.find((lang) => lang?.l?.code === locale)?.id,
            name: item.langs.find((lang) => lang?.l?.code === locale)?.name,
          },
        };
      }),
      _repertories: currentGroup?.repertories.map((item) => {
        const currentRepertoryLang = item.langs.find(
          (lang) => lang?.l?.code === locale
        );
        return {
          id: item.id,
          youtubeId: item.youtubeId,
          _lang: {
            id: currentRepertoryLang?.id,
            name: currentRepertoryLang?.name,
            description: currentRepertoryLang?.description,
          },
        };
      }),
      lat: currentGroup?.lat ?? "",
      lng: currentGroup?.lng ?? "",
      location: currentGroup?.location ?? "",
    },
  });

  const { fields: subGroupFields, append: appendSubGroupEvent } = useFieldArray(
    {
      control: form.control,
      name: "_subgroups",
    }
  );

  const { fields: repertoryFields, append: appendRepertory } = useFieldArray({
    control: form.control,
    name: "_repertories",
  });

  const isAbleToTravelWatch = useWatch({
    control: form.control,
    name: "_isAbleToTravel",
  });

  const currentSubgroups = useWatch({
    control: form.control,
    name: "_subgroups",
  });

  useEffect(() => {
    if (currentLang?.id) {
      form.setValue("_lang", {
        ...currentLang,
      });
    }

    currentGroup?.subgroups.forEach((subgroup, index) => {
      form.setValue(
        `_subgroups.${index}._lang.name`,
        subgroup.langs.at(0)?.name || ""
      );
      form.setValue(
        `_subgroups.${index}._lang.id`,
        subgroup.langs.at(0)?.id ?? 0
      );
    });

    currentGroup?.repertories.forEach((repertory, index) => {
      form.setValue(
        `_repertories.${index}._lang.name`,
        repertory.langs.at(0)?.name || ""
      );
      form.setValue(
        `_repertories.${index}._lang.description`,
        repertory.langs.at(0)?.description || ""
      );
      form.setValue(
        `_repertories.${index}._lang.id`,
        repertory.langs.at(0)?.id ?? 0
      );
    });
  }, [
    currentLang?.id,
    currentLang,
    currentGroup?.subgroups,
    currentGroup?.repertories,
    form,
  ]);

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

  const onSubmitForm: SubmitHandler<z.infer<typeof globalGroupSchema>> = async (
    _data
  ) => {
    const result = await updateGroup(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    customRevalidatePath(`/dashboard/groups/${currentGroup?.id}/edit`);
    customRevalidatePath("/dashboard/groups");

    if (result.success) {
      router.push("/dashboard/groups");
    }
  };

  return (
    <APIProvider apiKey={constants.google.apiKey!}>
      <div className="w-full p-4 md:p-6 ">
        <h1 className="text-2xl font-bold">{t("add_a_group")}</h1>
        <p className="text-sm text-muted-foreground pb-10 after:content-['*'] after:ml-0.5 after:text-red-500">
          {t("the_fields_mandatory")}
        </p>
        <Form {...form}>
          <form
            ref={formRef}
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmitForm)}
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
                  <CardTitle> {t("group_nformation")} </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={"_lang.name"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("name_of_the_group")}
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
                            {t("filled_auto_from_list_NS")}
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
                            {t("presid_general_dir_name")}
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
                            {t("presi_gene_dire_profile")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              placeholder={t("write_short_descrip")}
                              name={field.name}
                              onChange={field.onChange}
                              value={field.value || ""}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("you_can_max_500_input")}
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
                            {t("presid_general_direc_photo")}
                          </FormLabel>
                          <FormControl>
                            <FilepondImageUploader
                              id={field.name}
                              name={field.name}
                              allowImageCrop
                              disabled={isNSAccount}
                              acceptedFileTypes={["image/*"]}
                              imageCropAspectRatio="1:1"
                              defaultFiles={
                                currentGroup?.directorPhoto?.url
                                  ? [
                                      {
                                        source:
                                          currentGroup.directorPhoto?.url!,
                                        options: {
                                          type: "local",
                                        },
                                      },
                                    ]
                                  : []
                              }
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            name="_generalDirectorPhotoId"
                            type="hidden"
                            value={
                              currentGroup?.generalDirectorPhotoId ?? undefined
                            }
                          />
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
                            {t("arti_director_name")}
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
                            {t("arti_direc_profile")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              placeholder={t("write_descrip_studies")}
                              name={field.name}
                              onChange={field.onChange}
                              value={field.value || ""}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("you_can_max_500_input")}
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
                            {t("arti_director_photo")}
                          </FormLabel>
                          <FormControl>
                            <FilepondImageUploader
                              id={field.name}
                              name={field.name}
                              allowImageCrop
                              disabled={isNSAccount}
                              acceptedFileTypes={["image/*"]}
                              imageCropAspectRatio="1:1"
                              defaultFiles={
                                currentGroup?.artisticPhoto?.url
                                  ? [
                                      {
                                        source:
                                          currentGroup.artisticPhoto?.url!,
                                        options: {
                                          type: "local",
                                        },
                                      },
                                    ]
                                  : []
                              }
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            name="_artisticDirectorPhotoId"
                            type="hidden"
                            value={
                              currentGroup?.artisticDirectorPhotoId ?? undefined
                            }
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Musical Director */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={"musicalDirectorName"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("musical_director_name")}
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
                            {t("musi_director_profile")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              placeholder={t("write_short_descrip")}
                              name={field.name}
                              onChange={field.onChange}
                              value={field.value || ""}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("you_can_max_500_input")}
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
                            {t("musi_director_photo")}
                          </FormLabel>
                          <FormControl>
                            <FilepondImageUploader
                              id={field.name}
                              name={field.name}
                              allowImageCrop
                              disabled={isNSAccount}
                              acceptedFileTypes={["image/*"]}
                              imageCropAspectRatio="1:1"
                              defaultFiles={
                                currentGroup?.musicalPhoto?.url
                                  ? [
                                      {
                                        source: currentGroup.musicalPhoto?.url!,
                                        options: {
                                          type: "local",
                                        },
                                      },
                                    ]
                                  : []
                              }
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            name="_musicalDirectorPhotoId"
                            type="hidden"
                            value={
                              currentGroup?.musicalDirectorPhotoId ?? undefined
                            }
                          />
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
                            {t("phone_country_code")}
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={value as RPNInput.Value}
                              id="phone"
                              placeholder={t("enter_phone_number")}
                              international
                              {...fieldRest}
                              disabled={isNSAccount}
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
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="_lang.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("mail_ddress")}
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
                        defaultZoom={currentGroup?.lat ? 8 : 3}
                        defaultCenter={
                          currentGroup?.lat
                            ? {
                                lat: Number(currentGroup.lat),
                                lng: Number(currentGroup.lng),
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
                        defaultZoom={currentGroup?.lat ? 8 : 3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("group_details")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
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
                              defaultValue={currentCategoriesSelected!}
                              value={field.value}
                              handleChange={field.onChange}
                              categories={categories}
                              categoryType="groups"
                              isLoading={false}
                            />
                          </FormControl>
                          <FormMessage />
                          <input
                            type="hidden"
                            name="_categories"
                            value={JSON.stringify(
                              [
                                ...removeDuplicates(
                                  form.getValues("_categories") ?? []
                                ),
                              ]
                                .flat()
                                .filter(Boolean) || "[]"
                            )}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <div className="space-y-2">
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
                            <FormLabel>{t("type_of_group")}</FormLabel>
                            <FormControl>
                              <MultiSelect
                                ref={field.ref}
                                options={options}
                                disabled={isNSAccount}
                                value={field.value as string[]}
                                defaultValue={
                                  (field.value as string[])?.filter((item) =>
                                    options.find(
                                      (option) => option.value === item
                                    )
                                  ) ?? []
                                }
                                onValueChange={(values) => {
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
                  </div> */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="_isAbleToTravelToLiveMusic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("are_you_live_music")}</FormLabel>
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
                            {t("short_description")}
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
                          <FormDescription>
                            {t("max_500_words")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <div className="space-y-2">
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
                            <FormLabel>{t("group_age")}</FormLabel>
                            <FormControl>
                              <MultiSelect
                                ref={field.ref}
                                options={options}
                                disabled={isNSAccount}
                                value={field.value as string[]}
                                defaultValue={
                                  (field.value as string[])?.filter((item) =>
                                    options.find(
                                      (option) => option.value === item
                                    )
                                  ) ?? []
                                }
                                onValueChange={(values) => {
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
                  </div> */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={"membersNumber"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {t("number_of_members")}
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
                                    : 0
                                );
                              }}
                              onBlur={field.onBlur}
                              value={field.value || ""}
                              name={field.name}
                              disabled={isNSAccount}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("write_number_members")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <div className="space-y-2">
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
                            <FormLabel>{t("style_of_group")}</FormLabel>
                            <FormControl>
                              <MultiSelect
                                ref={field.ref}
                                options={options}
                                disabled={isNSAccount}
                                value={field.value as string[]}
                                defaultValue={
                                  (field.value as string[])?.filter((item) =>
                                    options.find(
                                      (option) => option.value === item
                                    )
                                  ) ?? []
                                }
                                onValueChange={(values) => {
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
                  </div> */}
                  <div className="space-y-4 border-t pt-4">
                    <h2 className="text-lg font-semibold">{t("sub_groups")}</h2>
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
                                    {t("name_the_sub_group")}
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
                                    {t("enter_cur_group_name")}
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
                                    {t("number_members")}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      ref={field.ref}
                                      type="number"
                                      max="40"
                                      onChange={(event) =>
                                        void field.onChange(
                                          Number(event.target.value)
                                        )
                                      }
                                      onBlur={field.onBlur}
                                      value={field.value ?? undefined}
                                      name={field.name}
                                      disabled={isNSAccount}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {t("write_number_members")}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* <div className="grid w-full items-center gap-1.5">
                            <FormField
                              control={form.control}
                              name={`_subgroups.${index}._groupAge`}
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
                                    <FormLabel>{t("group_age")}</FormLabel>
                                    <FormControl>
                                      <MultiSelect
                                        ref={field.ref}
                                        options={options}
                                        disabled={isNSAccount}
                                        defaultValue={field.value}
                                        onValueChange={(values) => {
                                          field.onChange(values);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                    <input
                                      type="hidden"
                                      name={`_subgroups.${index}._groupAge`}
                                      value={
                                        JSON.stringify(field.value) || "[]"
                                      }
                                    />
                                  </FormItem>
                                );
                              }}
                            />
                          </div> */}
                          <div className="grid w-full items-center gap-1.5">
                            <FormField
                              control={form.control}
                              name={`_subgroups.${index}._hasAnotherContact`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                      {t("another_contact")}
                                    </FormLabel>
                                    <FormDescription>
                                      {t("Do_anot_cont_person_group")}
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      name={field.name}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          {currentSubgroups[index]?._hasAnotherContact ? (
                            <div className="pl-5 border-l space-y-4 w-full">
                              <div className="grid w-full items-center gap-1.5">
                                <FormField
                                  control={form.control}
                                  name={`_subgroups.${index}.contactName`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t("contact_name")}</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        {t("prov_curr_contact_name")}
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid w-full items-center gap-1.5">
                                <FormField
                                  control={form.control}
                                  name={`_subgroups.${index}.contactMail`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {t("contact_email")}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        {t("prov_curr_contact_email")}
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid w-full items-center gap-1.5">
                                <FormField
                                  control={form.control}
                                  name={`_subgroups.${index}.contactPhone`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {t("contact_phone")}
                                      </FormLabel>
                                      <FormControl>
                                        <PhoneInput
                                          placeholder="Enter a phone number"
                                          international
                                          {...field}
                                          value={field.value as RPNInput.Value}
                                          disabled={isNSAccount}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        {t("prov_curr_contact_phone")}
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                    <input
                      type="hidden"
                      name="_subgroupSize"
                      value={subGroupFields.length}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isNSAccount}
                      onClick={(_) =>
                        appendSubGroupEvent({
                          _lang: {},
                          _groupAge: [],
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> {t("add_event")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("travel_information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="_isAbleToTravel"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t("are_avail_trave_year")}</FormLabel>
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
                                <FormLabel className="font-normal">
                                  {t("yes")}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t("no")}
                                </FormLabel>
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
                              <FormLabel>{t("any_specific_date")}</FormLabel>
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
                                              `_specificDate.from`
                                            ) ?? ""
                                          )
                                        : undefined,
                                      to:
                                        form.getValues(`_specificDate.to`) &&
                                        form.getValues(`_specificDate.from`) !==
                                          form.getValues(`_specificDate.to`)
                                          ? new Date(
                                              form.getValues(
                                                `_specificDate.to`
                                              )!
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
                                    "text-sm font-medium text-destructive"
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
                                <FormLabel>
                                  {t("any_specific_region")}
                                </FormLabel>
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
                                      <SelectValue
                                        placeholder={t("select_a_region")}
                                      />
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
                                              (lang) => lang.l?.code === locale
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
                  <CardTitle>{t("media")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photos">{t("photos")}</Label>
                    <FilepondImageUploader
                      id="photos"
                      name="photos"
                      allowMultiple
                      acceptedFileTypes={["image/*"]}
                      maxFiles={5}
                      defaultFiles={
                        currentGroup?.photos.length
                          ? currentGroup.photos.map((item) => {
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
                  <div className="space-y-2">
                    <Label htmlFor="coverPhoto">{t("cover_photo")}</Label>
                    <FilepondImageUploader
                      id="coverPhoto"
                      name="coverPhoto"
                      allowMultiple
                      maxFiles={3}
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
                  <div className="space-y-2">
                    <Label htmlFor="logo">{t("logo")}</Label>
                    <FilepondImageUploader
                      id="logo"
                      name="logo"
                      allowImageCrop
                      acceptedFileTypes={["image/*"]}
                      imageCropAspectRatio="1:1"
                      defaultFiles={
                        currentGroup?.logo?.url
                          ? [
                              {
                                source: currentGroup.logo?.url!,
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
                      value={currentGroup?.logoId ?? undefined}
                    />
                  </div>
                  <div>
                    <Label className="text-xl">{t("social_media")}</Label>
                    <div className="space-y-2 mt-3">
                      <div>
                        <Label htmlFor="youtube">Youtube</Label>
                        <Input
                          id="youtube"
                          name="youtube"
                          placeholder="https://www.youtube.com"
                          defaultValue={currentGroup?.youtubeId ?? undefined}
                          disabled={isNSAccount}
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          name="facebook"
                          type="url"
                          placeholder="https://www.facebook.com"
                          defaultValue={currentGroup?.facebookLink ?? undefined}
                          disabled={isNSAccount}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          type="url"
                          name="instagram"
                          placeholder="https://www.instagram.com"
                          defaultValue={
                            currentGroup?.instagramLink ?? undefined
                          }
                          disabled={isNSAccount}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">{t("website_link")}</Label>
                        <Input
                          id="website"
                          type="url"
                          name="website"
                          placeholder="https://www.google.com"
                          defaultValue={currentGroup?.websiteLink ?? undefined}
                          disabled={isNSAccount}
                        />
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-6">{t("media_description")}</p>
                  </div>
                </CardContent>
              </Card>
              {isFestivalAccount || isCurrentOwner ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("repertoire")}</CardTitle>
                    <CardDescription>
                      {t("add_your_perfo_repe_below")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {repertoryFields.map((item, index) => (
                      <div
                        key={item.id}
                        className="space-y-4 p-4 border rounded-lg relative"
                      >
                        <FormField
                          control={form.control}
                          name={`_repertories.${index}.id`}
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
                          name={`_repertories.${index}._lang.id`}
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
                        {/* <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeRepertoireItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button> */}
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`_repertories.${index}._lang.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("name")}</FormLabel>
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
                                  {t("enter_current_repertory")}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`_repertories.${index}._lang.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("description")}</FormLabel>
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
                                <FormDescription>
                                  {t("max_500_words")}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2 hidden">
                          <Label htmlFor={`section${item.id}Photos`}>
                            {t("photos_costume")}
                          </Label>
                          <Input
                            id={`section${item.id}Photos`}
                            type="file"
                            accept="image/*"
                            multiple
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`_repertories.${index}.youtubeId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("video_youtube_link")}</FormLabel>
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
                                  {t("enter_video_link_youtube")}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    <input
                      type="hidden"
                      name="_repertorySize"
                      value={repertoryFields.length}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendRepertory({ _lang: {} })}
                      className="w-full"
                      disabled={isNSAccount}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {t("add_repertoire")}
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>{t("additional_information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="linkPortfolio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("upload_group_port_brochure")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              ref={field.ref}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              value={field.value ?? ""}
                              name={field.name}
                              disabled={isNSAccount}
                              placeholder="Provide the link of your portfolio/brochure"
                            />
                          </FormControl>
                          <FormDescription>
                            {t("only_pdf_max_10MB")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="hidden">
                <CardHeader>
                  <CardTitle>{t("recognition_certification")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recognitionCertificate">
                      {t("upload_recogn_cert")}
                    </Label>
                    <Input
                      id="recognitionCertificate"
                      name="recognitionCertificate"
                      type="file"
                      disabled={isNSAccount}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            {!isNSAccount ? (
              <div className="sticky bottom-5 mt-4 right-0 flex justify-end px-4">
                <Card className="flex justify-end gap-4 w-full">
                  <CardContent className="flex-row items-center p-4 flex w-full justify-end">
                    <div className="flex gap-2">
                      <Button variant="ghost" asChild>
                        <Link href="/dashboard/national-sections">
                          {t("cancel")}
                        </Link>
                      </Button>
                      <Button
                        type="submit"
                        aria-disabled={form.formState.isSubmitting}
                        disabled={form.formState.isSubmitting}
                        className="space-y-0"
                      >
                        {t("save")}
                      </Button>
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
