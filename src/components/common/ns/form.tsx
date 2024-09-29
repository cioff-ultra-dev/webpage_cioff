"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, ButtonProps } from "@/components/ui/button";
import { createNationalSection, updateNationalSection } from "@/app/actions";
import { useFormState, useFormStatus } from "react-dom";
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
import {
  inserFestivalByNSSchema,
  inserNationalSectionLangSchema,
  insertGroupByNSSchema,
  insertNationalSectionPositionsLangSchema,
  insertNationalSectionPositionsSchema,
  insertNationalSectionSchema,
  insertSocialMediaLinkSchema,
} from "@/db/schema";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { PhoneInput } from "@/components/ui/phone-input";
import { NationalSectionDetailsType } from "@/db/queries/national-sections";
import { useTranslations } from "next-intl";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { toast } from "sonner";
import { customRevalidateTag } from "../revalidateTag";
import { useRouter } from "next/navigation";

const positionsSchema = insertNationalSectionPositionsSchema.merge(
  z.object({
    _lang: insertNationalSectionPositionsLangSchema,
    _birthDate: z.string().optional(),
    _deathDate: z.string().optional(),
    _photo: z
      .any()
      .refine((item) => item instanceof File || typeof item === "undefined", {
        params: { i18n: "file_required" },
      }),
  })
);

const honorariesSchema = insertNationalSectionPositionsSchema
  .merge(
    z.object({
      _lang: insertNationalSectionPositionsLangSchema,
      _birthDate: z.string().optional(),
      _deathDate: z.string().optional(),
      _photo: z
        .any()
        .refine((item) => item instanceof File || typeof item === "undefined", {
          params: { i18n: "file_required" },
        }),
    })
  )
  .extend({
    email: z.string().optional(),
    phone: z.string().optional(),
  });

const formNationalSectionSchema = insertNationalSectionSchema.merge(
  z.object({
    _lang: inserNationalSectionLangSchema,
    _positions: z.array(positionsSchema),
    _honoraries: z.array(honorariesSchema),
    _festivals: z.array(
      inserFestivalByNSSchema.merge(
        z.object({
          certificationFile: z.any().refine(
            (item) => {
              return item instanceof File || typeof item !== "undefined";
            },
            { params: { i18n: "file_required" } }
          ),
        })
      )
    ),
    _social: insertSocialMediaLinkSchema,
    _groups: z.array(
      insertGroupByNSSchema.merge(
        z.object({
          certificationFile: z
            .any()
            .refine(
              (item) => item instanceof File || typeof item !== "undefined",
              { params: { i18n: "file_required" } }
            ),
        })
      )
    ),
  })
);

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

export default function NationalSectionForm({
  currentNationalSection,
  currentLang,
  id,
}: {
  currentNationalSection?: NationalSectionDetailsType | undefined;
  currentLang?: NonNullable<NationalSectionDetailsType>["langs"][number];
  id?: string;
}) {
  // const [state, formAction] = useFormState(, null);
  useI18nZodErrors("ns");
  const form = useForm<z.infer<typeof formNationalSectionSchema>>({
    resolver: zodResolver(formNationalSectionSchema),
    defaultValues: {
      id: Number(id),
      slug: currentNationalSection?.slug,
      _lang: {
        name: currentLang?.name,
        about: currentLang?.about,
        aboutYoung: currentLang?.aboutYoung,
      },
      _social: currentNationalSection?.social || {},
      _positions:
        currentNationalSection?.positions
          ?.filter((position) => !position.isHonorable)
          .map((position) => {
            return {
              ...position,
              _lang: {
                id: position?.langs?.at(0)?.id ?? 0,
                shortBio: position.langs.at(0)?.shortBio,
              },
            };
          }) ?? [],
      _honoraries:
        currentNationalSection?.positions
          ?.filter((position) => position.isHonorable)
          .map((position) => {
            return {
              ...position,
              email: position.email || "",
              _birthDate: position.birthDate
                ? position.birthDate.toUTCString()
                : "",
              _deathDate: position.deadDate
                ? position.deadDate.toUTCString()
                : "",
              _lang: {
                id: position?.langs?.at(0)?.id ?? 0,
                shortBio: position.langs.at(0)?.shortBio,
              },
            };
          }) ?? [],
      _festivals: [],
      _groups: [],
    },
  });

  const t = useTranslations("form.ns");

  useEffect(() => {
    console.log({ about: currentLang?.about });

    form.setValue("_lang.name", currentLang?.name || "");
    form.setValue("_lang.about", currentLang?.about || "");
    form.setValue("_lang.aboutYoung", currentLang?.aboutYoung || "");

    currentNationalSection?.positions
      .filter((position) => !position.isHonorable)
      .forEach((position, index) => {
        form.setValue(
          `_positions.${index}._lang.shortBio`,
          position.langs.at(0)?.shortBio || ""
        );
        form.setValue(
          `_positions.${index}._lang.id`,
          position.langs.at(0)?.id ?? 0
        );
      });
    currentNationalSection?.positions
      .filter((position) => position.isHonorable)
      .forEach((position, index) => {
        form.setValue(
          `_honoraries.${index}._lang.shortBio`,
          position.langs.at(0)?.shortBio || ""
        );
        form.setValue(
          `_honoraries.${index}._lang.id`,
          position.langs.at(0)?.id ?? 0
        );
      });
  }, [
    currentLang?.name,
    currentLang?.about,
    currentLang?.aboutYoung,
    currentNationalSection?.positions,
    form,
  ]);

  const { fields: positionFields, append: appendPosition } = useFieldArray({
    control: form.control,
    name: "_positions",
  });

  const { fields: honoraryFields, append: appendHonorary } = useFieldArray({
    control: form.control,
    name: "_honoraries",
  });

  const {
    fields: festivalFields,
    append: appendFestival,
    remove: removeFestival,
  } = useFieldArray({
    control: form.control,
    name: "_festivals",
  });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control: form.control,
    name: "_groups",
  });

  const formRef = useRef<HTMLFormElement>(null);

  console.log(currentNationalSection);

  const onSubmitForm: SubmitHandler<
    z.infer<typeof formNationalSectionSchema>
  > = async (_data) => {
    const result = await updateNationalSection(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    // customRevalidateTag("/dashboard/national-sections");
    // router.push("/dashboard/national-sections");
  };

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground pb-10">{t("disclaimer")}</p>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmitForm)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Organization Registration Form</CardTitle>
              <CardDescription>
                Please fill out the details for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Module 1: Profile</h2>
                <FormField
                  control={form.control}
                  name="slug"
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
                <div className="grid w-full items-center gap-1.5">
                  <FormField
                    control={form.control}
                    name="_lang.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          {t("_lang.name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter association name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <FormField
                    control={form.control}
                    name="_lang.about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          About National Section
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell the public about the NS main activities or projects, year of creation, etc."
                            className="resize-none"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value}
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
              </div>
              {positionFields.map((field, index) => {
                const positionIndex = index + 1;
                return (
                  <div key={field.id} className="space-y-4 border-t pt-4">
                    <h3 className="font-medium">Position {positionIndex}</h3>
                    <FormField
                      control={form.control}
                      name={`_positions.${index}.id`}
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
                        name={`_positions.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={
                                  field.value === "" ? undefined : field.value
                                }
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your current name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}.email`}
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
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}.phone`}
                        render={({ field: { value, ...fieldRest } }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                              Phone Number (country code)
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={value as RPNInput.Value}
                                id="phone"
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
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}._photo`}
                        render={({
                          field: { value, onChange, ...fieldProps },
                        }) => (
                          <FormItem>
                            <FormLabel>Picture</FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps}
                                placeholder="Picture"
                                type="file"
                                accept="image/*, application/pdf"
                                onChange={(event) =>
                                  onChange(
                                    event.target.files && event.target.files[0]
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}._lang.id`}
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              name={field.name}
                              onChange={field.onChange}
                              value={field.value}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              type="hidden"
                            />
                          </FormControl>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`_positions.${index}._lang.shortBio`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a bit about you"
                                className="resize-none"
                                name={field.name}
                                onChange={field.onChange}
                                value={field.value || undefined}
                                onBlur={field.onBlur}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormDescription>
                              You can use max. 200 words for this input
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button variant="outline" disabled>
                      See contact information
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                onClick={(_) =>
                  appendPosition({
                    name: "",
                    phone: "",
                    email: "",
                    _photo: undefined,
                    _lang: { shortBio: "" },
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Position
              </Button>
              <input
                type="hidden"
                name="_positionSize"
                value={positionFields.length}
              />
              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                  About Youth Commission
                </h2>
                <div className="grid w-full items-center gap-1.5">
                  <FormField
                    control={form.control}
                    name="_lang.aboutYoung"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter details about youth commission"
                            className="resize-none"
                            onChange={field.onChange}
                            value={field.value}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
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
              </div>
              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">
                  CIOFF International Honorary Members
                </h2>
                {honoraryFields.map((field, index) => {
                  const positionIndex = index + 1;
                  return (
                    <div key={field.id} className="space-y-4  pt-4">
                      <h3 className="font-medium">Honorary {positionIndex}</h3>
                      <FormField
                        control={form.control}
                        name={`_honoraries.${index}.id`}
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
                          name={`_honoraries.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  ref={field.ref}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  value={
                                    field.value === "" ? undefined : field.value
                                  }
                                  name={field.name}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter your current name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_honoraries.${index}._photo`}
                          render={({
                            field: { value, onChange, ...fieldProps },
                          }) => (
                            <FormItem>
                              <FormLabel>Picture</FormLabel>
                              <FormControl>
                                <Input
                                  {...fieldProps}
                                  placeholder="Picture"
                                  type="file"
                                  accept="image/*, application/pdf"
                                  onChange={(event) =>
                                    onChange(
                                      event.target.files &&
                                        event.target.files[0]
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_honoraries.${index}._lang.id`}
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                name={field.name}
                                onChange={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                type="hidden"
                              />
                            </FormControl>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`_honoraries.${index}._lang.shortBio`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Short Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a bit about you"
                                  className="resize-none"
                                  name={field.name}
                                  onChange={field.onChange}
                                  defaultValue={field.value || undefined}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                />
                              </FormControl>
                              <FormDescription>
                                You can use max. 200 words for this input
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_honoraries.${index}._birthDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date of birth</FormLabel>
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
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    fromYear={1900}
                                    toYear={new Date().getFullYear()}
                                    defaultMonth={new Date(2024, 6)}
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(value) =>
                                      field.onChange(value?.toUTCString())
                                    }
                                    disabled={(date: Date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                              <input
                                type="hidden"
                                name={`_honoraries.${index}._birthDate`}
                                value={field.value}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_honoraries.${index}._deathDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date of death</FormLabel>
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
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    fromYear={1900}
                                    toYear={new Date().getFullYear()}
                                    defaultMonth={new Date(2024, 6)}
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(value) =>
                                      field.onChange(value?.toUTCString())
                                    }
                                    disabled={(date: Date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                              <input
                                type="hidden"
                                name={`_honoraries.${index}._deathDate`}
                                value={field.value}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  onClick={(_) =>
                    appendHonorary({
                      name: "",
                      phone: "",
                      email: "",
                      isHonorable: true,
                      _photo: undefined,
                      _lang: { shortBio: "" },
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Honorary Member
                </Button>
                <input
                  type="hidden"
                  name="_honorarySize"
                  value={honoraryFields.length}
                />
              </div>
              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Social media</h2>
                <FormField
                  control={form.control}
                  name="_social.id"
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
                <div className="grid w-full items-center gap-1.5">
                  <FormField
                    control={form.control}
                    name="_social.facebookLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>Enter Facebook URL</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <FormField
                    control={form.control}
                    name="_social.instagramLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>Enter Instagram URL</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <FormField
                    control={form.control}
                    name="_social.websiteLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value || ""}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>Enter Website URL</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Other events</h2>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="other-events">Name of the event</Label>
                  <Input
                    disabled
                    id="other-events"
                    placeholder="Enter event name"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="event-description">Short description</Label>
                  <Textarea
                    id="event-description"
                    placeholder="Max 400 words"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Module 2: Members</h2>
                <p className="text-sm text-muted-foreground">
                  Register your members. Only the sections and groups approved
                  by you will be visible to the public. You need to register at
                  least one international festival.
                </p>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Festivals</h2>
                {festivalFields.map((field, index) => {
                  return (
                    <div
                      key={field.id}
                      className="space-y-4 p-4 border rounded-md"
                    >
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_festivals.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                Name of the festival
                              </FormLabel>
                              <FormControl>
                                <Input
                                  ref={field.ref}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  value={
                                    field.value === "" ? undefined : field.value
                                  }
                                  name={field.name}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter your current festival name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_festivals.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                Email address
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
                                Enter your email address
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_festivals.${index}.certificationFile`}
                          render={({
                            field: { value, onChange, ...fieldProps },
                          }) => (
                            <FormItem>
                              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                Upload certification of membership
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...fieldProps}
                                  placeholder="Picture"
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(event) =>
                                    onChange(
                                      event.target.files &&
                                        event.target.files[0]
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Link to a PDF or word document
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch id={`festival-turn-${field.id}`} disabled />
                          <Label htmlFor={`festival-turn-${field.id}`}>
                            Turn off profile
                          </Label>
                        </div>
                      </div>
                      {festivalFields.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFestival(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Festival
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  onClick={() =>
                    appendFestival({
                      name: "",
                      email: "",
                      certificationFile: null,
                    })
                  }
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Festival
                </Button>
                <input
                  type="hidden"
                  name="_festivalSize"
                  value={festivalFields.length}
                />
              </div>
              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Groups</h2>
                {groupFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_groups.${index}.name`}
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
                                value={
                                  field.value === "" ? undefined : field.value
                                }
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your group name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_groups.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                              Email address
                            </FormLabel>
                            <FormControl>
                              <Input
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value || undefined}
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your email address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_groups.${index}.certificationFile`}
                        render={({
                          field: { value, onChange, ...fieldProps },
                        }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                              Upload certification of membership
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps}
                                placeholder="Picture"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(event) =>
                                  onChange(
                                    event.target.files && event.target.files[0]
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Link to a PDF or word document
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id={`festival-turn-${field.id}`} disabled />
                        <Label htmlFor={`festival-turn-${field.id}`}>
                          Turn off profile
                        </Label>
                      </div>
                    </div>
                    {festivalFields.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeGroup(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Group
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    appendGroup({
                      name: "",
                      email: "",
                      certificationFile: null,
                    })
                  }
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Group
                </Button>
                <input
                  type="hidden"
                  name="_groupSize"
                  value={groupFields.length}
                />
              </div>
            </CardContent>
          </Card>
          <div className="sticky bottom-5 mt-4 right-0 flex justify-end px-4">
            <Card className="flex justify-end gap-4 w-full">
              <CardContent className="flex-row items-center p-4 flex w-full justify-end">
                <div className="flex gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard/national-section">Cancel</Link>
                  </Button>
                  <Submit
                    label="Save"
                    isLoading={form.formState.isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
