"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, ButtonProps } from "@/components/ui/button";
import { updateNationalSection } from "@/app/actions";
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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  inserNationalSectionLangSchema,
  insertEventLangSchema,
  insertEventSchema,
  insertNationalSectionPositionsLangSchema,
  insertNationalSectionPositionsSchema,
  insertNationalSectionSchema,
  insertSocialMediaLinkSchema,
} from "@/db/schema";
import { CalendarIcon, PlusCircle } from "lucide-react";
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
import {
  NationalSectionDetailsType,
  PositionTypeForNSType,
} from "@/db/queries/national-sections";
import { useTranslations } from "next-intl";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { toast } from "sonner";
import { customRevalidatePath, customRevalidateTag } from "../revalidateTag";
import { useRouter } from "next/navigation";
import { DatePickerWithRange } from "@/components/ui/datepicker-with-range";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Session } from "next-auth";
import { FilepondImageUploader } from "@/components/extension/filepond-image-uploader";

const positionsSchema = insertNationalSectionPositionsSchema.merge(
  z.object({
    _lang: insertNationalSectionPositionsLangSchema,
    _isHonorable: z.boolean().optional(),
    _birthDate: z.string().optional(),
    _deathDate: z.string().optional(),
    _type: z.string(),
    _photo: z
      .object({
        id: z.number(),
        url: z.string(),
      })
      .optional(),
    // .refine((item) => item instanceof File || typeof item === "undefined", {
    //   params: { i18n: "file_required" },
    // }),
  })
);

const formNationalSectionSchema = insertNationalSectionSchema.merge(
  z.object({
    _lang: inserNationalSectionLangSchema,
    _positions: z.array(positionsSchema),
    _positionSize: z.array(z.any()).min(3).max(11),
    _events: z.array(
      insertEventSchema.pick({ id: true }).extend({
        _startDate: z.string().datetime().optional(),
        _endDate: z.string().datetime().optional(),
        _rangeDate: z.object({
          from: z.string(),
          to: z.string().optional(),
        }),
        _lang: insertEventLangSchema,
      })
    ),
    _social: insertSocialMediaLinkSchema,
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
  typePositions,
  id,
  slug,
  session,
  locale,
}: {
  session?: Session;
  currentNationalSection?: NationalSectionDetailsType | undefined;
  currentLang?: NonNullable<NationalSectionDetailsType>["langs"][number];
  typePositions?: PositionTypeForNSType;
  id?: string;
  slug?: string;
  locale?: string;
}) {
  useI18nZodErrors("ns");

  const isNSAccount = session?.user.role?.name === "National Sections";

  const form = useForm<z.infer<typeof formNationalSectionSchema>>({
    resolver: zodResolver(formNationalSectionSchema),
    defaultValues: {
      id: Number(id),
      slug: currentNationalSection?.slug,
      _lang: {
        id: currentLang?.id ?? 0,
        name: currentLang?.name,
        about: currentLang?.about,
      },
      _social: currentNationalSection?.social || {},
      _events: currentNationalSection?.otherEvents.map((event) => {
        return {
          ...event,
          _rangeDate: {
            from: event.startDate?.toUTCString() ?? "",
            to: event.endDate?.toUTCString() ?? "",
          },
          _lang: {
            id: event.langs.at(0)?.id ?? 0,
            name: event.langs.at(0)?.name || "",
            description: event.langs.at(0)?.description || "",
          },
        };
      }),
      _positions: currentNationalSection?.positions.length
        ? currentNationalSection?.positions.map((position) => {
            return {
              ...position,
              _type: position.typePositionId
                ? String(position.typePositionId)
                : undefined,
              _isHonorable: position.isHonorable ?? false,
              _birthDate: position.birthDate
                ? position.birthDate.toUTCString()
                : "",
              _deathDate: position.deadDate
                ? position.deadDate.toUTCString()
                : "",
              _lang: {
                id: position?.langs?.at(0)?.id ?? 0,
                shortBio: position.langs.at(0)?.shortBio,
                otherMemberName:
                  position.langs.at(0)?.otherMemberName ?? undefined,
              },
              _photo: {
                id: position.photo?.id ?? 0,
                url: position.photo?.url ?? "",
              },
            };
          })
        : [
            {
              name: "",
              phone: "",
              email: "",
              _photo: undefined,
              _lang: { shortBio: "" },
            },
          ],
    },
  });

  const t = useTranslations("form.ns");
  const router = useRouter();

  useEffect(() => {
    if (currentLang?.id) {
      form.setValue("_lang", {
        ...currentLang,
      });
    }

    currentNationalSection?.positions.forEach((position, index) => {
      form.setValue(
        `_positions.${index}._lang.shortBio`,
        position.langs.at(0)?.shortBio || ""
      );
      form.setValue(
        `_positions.${index}._lang.otherMemberName`,
        position.langs.at(0)?.otherMemberName || ""
      );
      form.setValue(
        `_positions.${index}._lang.id`,
        position.langs.at(0)?.id ?? 0
      );
    });

    currentNationalSection?.otherEvents.forEach((event, index) => {
      form.setValue(
        `_events.${index}._lang.name`,
        event.langs.at(0)?.name || ""
      );

      form.setValue(
        `_events.${index}._lang.description`,
        event.langs.at(0)?.description || ""
      );
      form.setValue(`_events.${index}._lang.id`, event.langs.at(0)?.id ?? 0);
    });
  }, [
    currentLang?.id,
    currentLang,
    currentNationalSection?.positions,
    currentNationalSection?.otherEvents,
    form,
  ]);

  const { fields: positionFields, append: appendPosition } = useFieldArray({
    control: form.control,
    name: "_positions",
  });

  const {
    fields: eventFields,
    append: appendEvent,
    remove: removeEvent,
  } = useFieldArray({
    control: form.control,
    name: "_events",
  });

  const positions = useWatch({
    control: form.control,
    name: "_positions",
  });

  useEffect(() => {
    form.setValue("_positionSize", Array.from({ length: positions.length }));
  }, [positions, form]);

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitForm: SubmitHandler<
    z.infer<typeof formNationalSectionSchema>
  > = async (_data) => {
    const result = await updateNationalSection(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    customRevalidatePath(`/dashboard/national-sections/${slug}/edit`);
    customRevalidatePath("/dashboard/national-sections");

    if (result.success) {
      router.push("/dashboard/national-sections");
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground pb-10">{t("disclaimer")}</p>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmitForm)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>{t("organi_registra_form")}</CardTitle>
              <CardDescription>{t("please_fill_out_details")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {t("module_1_profile")}
                </h2>
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
                          disabled={!isNSAccount}
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
                          disabled={!isNSAccount}
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
                          disabled={!isNSAccount}
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
                            disabled={!isNSAccount}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("enter_associ_name")}
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
                          {t("about_national_secti")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("Tell_public_about_NS_etc")}
                            className="resize-none"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value || ""}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            disabled={!isNSAccount}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("You_can_use_max_500_words")}
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
                    <h3 className="font-medium">
                      {" "}
                      {t("position")} {positionIndex}
                    </h3>
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
                            disabled={!isNSAccount}
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
                              {t("name")}
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
                                disabled={!isNSAccount}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("enter_current_name")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}._type`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>{t("type_position")}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    data-test={field.value}
                                    className={cn(
                                      "justify-between capitalize",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={!isNSAccount}
                                  >
                                    {field.value
                                      ? typePositions
                                          ?.find(
                                            (typePosition) =>
                                              String(typePosition.id) ===
                                              field.value
                                          )
                                          ?.langs.find(
                                            (lang) => lang.l?.code === locale
                                          )?.name
                                      : t("select_type_positi")}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput
                                    placeholder={t("search_type")}
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      {t("no_type_position_found")}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {typePositions?.map((typePosition) => (
                                        <CommandItem
                                          value={String(
                                            typePosition.langs.find(
                                              (lang) => lang.l?.code === locale
                                            )?.name
                                          )}
                                          key={`_positions.${index}._type.${String(
                                            typePosition.id
                                          )}`}
                                          className="capitalize"
                                          onSelect={() => {
                                            form.setValue(
                                              `_positions.${index}._type`,
                                              String(typePosition.id)
                                            );
                                          }}
                                        >
                                          {
                                            typePosition.langs.find(
                                              (lang) => lang.l?.code === locale
                                            )?.name
                                          }
                                          <CheckIcon
                                            className={cn(
                                              "ml-auto h-4 w-4",
                                              String(typePosition.id) ===
                                                field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              {t("this_type_posi_used_nationalsec")}
                            </FormDescription>
                            <FormMessage />
                            <input
                              type="hidden"
                              name={`_positions.${index}._type`}
                              value={field.value}
                              disabled={!isNSAccount}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    {typePositions?.find(
                      (item) => item.id === Number(positions?.[index]?._type)
                    )?.slug === "other-member" ? (
                      <div className="grid w-full items-center gap-1.5 pl-5 border-l">
                        <FormField
                          control={form.control}
                          name={`_positions.${index}._lang.otherMemberName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("member_name")}</FormLabel>
                              <FormControl>
                                <Input
                                  ref={field.ref}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  value={field.value || ""}
                                  name={field.name}
                                  disabled={!isNSAccount}
                                />
                              </FormControl>
                              <FormDescription>
                                {t("enter_custom_me_name")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : null}
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                              {t("email_address")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value || ""}
                                name={field.name}
                                disabled={!isNSAccount}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("enter_current_email_addre")}
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
                              {t("phone_number")}
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={value as RPNInput.Value}
                                id="phone"
                                international
                                disabled={!isNSAccount}
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
                    <div className="grid w-full items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`_positions.${index}._photo`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Picture</FormLabel>
                            <FormControl>
                              <FilepondImageUploader
                                id={field.name}
                                name={field.name}
                                disabled={!isNSAccount}
                                acceptedFileTypes={["image/*"]}
                                defaultFiles={
                                  field.value?.url
                                    ? [
                                        {
                                          source: field.value?.url!,
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
                              name={`_positions.${index}._photo.id`}
                              value={field.value?.id ?? undefined}
                              type="hidden"
                              disabled={!isNSAccount}
                            />
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
                              disabled={!isNSAccount}
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
                                disabled={!isNSAccount}
                              />
                            </FormControl>
                            <FormDescription>
                              You can use max. 200 words for this input
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {session?.user.role?.name === "Admin" ||
                      session?.user.role?.name === "Council" ? (
                        <>
                          <FormField
                            control={form.control}
                            name={`_positions.${index}._isHonorable`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Honorary Member</FormLabel>
                                  <FormDescription>
                                    Receive honorary members for this national
                                    section
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    defaultChecked={field.value}
                                    onCheckedChange={field.onChange}
                                    name={field.name}
                                    disabled={!isNSAccount}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          {positions?.[index]?._isHonorable ? (
                            <div className="pl-5 border-l space-y-4 pt-4">
                              <FormField
                                control={form.control}
                                name={`_positions.${index}._birthDate`}
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
                                              !field.value &&
                                                "text-muted-foreground"
                                            )}
                                            disabled={!isNSAccount}
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
                                            date < new Date("1900-01-01") ||
                                            !isNSAccount
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    <input
                                      type="hidden"
                                      name={`_positions.${index}._birthDate`}
                                      value={field.value}
                                      disabled={!isNSAccount}
                                    />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`_positions.${index}._deathDate`}
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
                                              !field.value &&
                                                "text-muted-foreground"
                                            )}
                                            disabled={!isNSAccount}
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
                                            date < new Date("1900-01-01") ||
                                            !isNSAccount
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    <input
                                      type="hidden"
                                      name={`_positions.${index}._deathDate`}
                                      value={field.value}
                                      disabled={!isNSAccount}
                                    />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    {/* <Button variant="outline" disabled>
                      See contact information
                    </Button> */}
                  </div>
                );
              })}
              {form.getFieldState("_positionSize").error ? (
                <p className={cn("text-sm font-medium text-destructive")}>
                  {form.getFieldState("_positionSize").error?.message}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={!isNSAccount}
                onClick={(_) =>
                  appendPosition({
                    name: "",
                    phone: "",
                    email: "",
                    _photo: undefined,
                    _type: "",
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
                disabled={!isNSAccount}
              />
              {/* <div className="space-y-4 border-t pt-4"> */}
              {/*   <h2 className="text-lg font-semibold after:content-['*'] after:ml-0.5 after:text-red-500"> */}
              {/*     About Youth Commission */}
              {/*   </h2> */}
              {/*   <div className="grid w-full items-center gap-1.5"> */}
              {/*     <FormField */}
              {/*       control={form.control} */}
              {/*       name="_lang.aboutYoung" */}
              {/*       render={({ field }) => ( */}
              {/*         <FormItem> */}
              {/*           <FormControl> */}
              {/*             <Textarea */}
              {/*               placeholder="Enter details about youth commission" */}
              {/*               className="resize-none" */}
              {/*               onChange={field.onChange} */}
              {/*               value={field.value} */}
              {/*               onBlur={field.onBlur} */}
              {/*               ref={field.ref} */}
              {/*               name={field.name} */}
              {/*             /> */}
              {/*           </FormControl> */}
              {/*           <FormDescription> */}
              {/*             You can use max. 500 words for this input */}
              {/*           </FormDescription> */}
              {/*           <FormMessage /> */}
              {/*         </FormItem> */}
              {/*       )} */}
              {/*     /> */}
              {/*   </div> */}
              {/* </div> */}
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
                        disabled={!isNSAccount}
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
                            disabled={!isNSAccount}
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
                            disabled={!isNSAccount}
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
                            disabled={!isNSAccount}
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
                {eventFields.map((field, index) => (
                  <Card
                    key={field.id}
                    className="grid w-full items-center pt-6 gap-1.5"
                  >
                    <FormField
                      control={form.control}
                      name={`_events.${index}.id`}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value}
                            name={field.name}
                            type="hidden"
                            disabled={!isNSAccount}
                          />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`_events.${index}._lang.id`}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            ref={field.ref}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            value={field.value}
                            name={field.name}
                            type="hidden"
                            disabled={!isNSAccount}
                          />
                        </FormControl>
                      )}
                    />
                    <CardContent className=" flex items-center flex-col gap-5">
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_events.${index}._lang.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                Name of the event
                              </FormLabel>
                              <FormControl>
                                <Input
                                  ref={field.ref}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  value={field.value ?? ""}
                                  name={field.name}
                                  disabled={!isNSAccount}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter your current event name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <FormField
                          control={form.control}
                          name={`_events.${index}._lang.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Short Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="resize-none"
                                  name={field.name}
                                  onChange={field.onChange}
                                  value={field.value || ""}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  disabled={!isNSAccount}
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
                          name={`_events.${index}._rangeDate`}
                          render={({ field: { value, onChange } }) => (
                            <FormItem>
                              <FormLabel>Dates</FormLabel>
                              <FormControl>
                                <>
                                  <DatePickerWithRange
                                    className="w-full"
                                    buttonClassName="w-full"
                                    defaultDates={{
                                      from: form.getValues(
                                        `_events.${index}._rangeDate.from`
                                      )
                                        ? new Date(
                                            form.getValues(
                                              `_events.${index}._rangeDate.from`
                                            )
                                          )
                                        : undefined,
                                      to:
                                        form.getValues(
                                          `_events.${index}._rangeDate.to`
                                        ) &&
                                        form.getValues(
                                          `_events.${index}._rangeDate.from`
                                        ) !==
                                          form.getValues(
                                            `_events.${index}._rangeDate.to`
                                          )
                                          ? new Date(
                                              form.getValues(
                                                `_events.${index}._rangeDate.to`
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
                                    disabled={!isNSAccount}
                                  />
                                  <input
                                    type="hidden"
                                    name={`_events.${index}._rangeDate.from`}
                                    value={value.from}
                                    disabled={!isNSAccount}
                                  />
                                  <input
                                    type="hidden"
                                    name={`_events.${index}._rangeDate.to`}
                                    value={value.to}
                                    disabled={!isNSAccount}
                                  />
                                </>
                              </FormControl>
                              {form?.getFieldState(
                                `_events.${index}._rangeDate.from`
                              ).error?.message ? (
                                <p
                                  className={cn(
                                    "text-sm font-medium text-destructive"
                                  )}
                                >
                                  {
                                    form?.getFieldState(
                                      `_events.${index}._rangeDate.from`
                                    ).error?.message
                                  }
                                </p>
                              ) : null}
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  disabled={!isNSAccount}
                  onClick={(_) =>
                    appendEvent({
                      _rangeDate: { from: "" },
                      _lang: { name: "", description: "" },
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
                <input
                  type="hidden"
                  name="_eventSize"
                  value={eventFields.length}
                  disabled={!isNSAccount}
                />
              </div>
            </CardContent>
          </Card>
          {isNSAccount ? (
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
          ) : null}
        </form>
      </Form>
    </div>
  );
}
