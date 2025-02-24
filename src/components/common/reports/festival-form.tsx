"use client";

import {
  RatingQuestionsType,
  ReportFestivalType,
  ReportTypeCategoriesType,
} from "@/db/queries/reports";
import {
  groups,
  insertRatingFestivalToGroupsAnswersSchema,
  insertRatingFestivalToGroupsSchema,
  insertReportFestivalNonGroupsSchema,
  insertReportFestivalSchema,
} from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, ButtonProps } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { customRevalidateTag } from "../revalidateTag";
import { useLocale, useTranslations } from "next-intl";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { FestivalByIdType } from "@/db/queries/events";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { CountryByLocaleType } from "@/db/queries/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import fetcher from "@/lib/utils";
import useSWR from "swr";
import { buildGroup } from "@/db/queries/groups";

function calculateRatingResult(ratings: number[]) {
  const totalRatings = ratings.length;
  if (totalRatings === 0) return 0;

  const sumRatings = ratings.reduce((sum, rating) => sum + rating, 0);
  return sumRatings / totalRatings;
}

async function insertReport(
  url: string,
  { arg }: { arg: z.infer<typeof formReportFestivalSchema> }
) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((response) => response.json());
}

export const formReportFestivalSchema = insertReportFestivalSchema.merge(
  z.object({
    _typeActivitiesSelected: z.array(z.string()),
    _isNonCioffGroups: z.boolean().optional(),
    _countrySelected: z.string().optional(),
    _currentNonCioffGroups: insertReportFestivalNonGroupsSchema
      .pick({
        howMany: true,
        emailProvided: true,
      })
      .optional(),
    _reportGroups: z.array(
      insertRatingFestivalToGroupsSchema.omit({ reportFestivalId: true }).merge(
        z.object({
          name: z.string(),
          country: z.string(),
          confirmed: z.boolean(),
          _invitationThrough: z.string().optional(),
          _questions: z.array(
            insertRatingFestivalToGroupsAnswersSchema
              .pick({ rating: true, comment: true })
              .merge(
                z.object({
                  name: z.string(),
                  questionId: z.number(),
                })
              )
              .refine(
                (data) =>
                  data.rating > 3 ||
                  (data.rating <= 3 &&
                    data.comment &&
                    data.comment.trim() !== ""),
                {
                  path: ["comment"],
                  params: { i18n: "mandatory_rating_comment" },
                }
              )
          ),
        })
      )
    ),
  })
);

function Submit({
  label = "Save",
  variant = "default",
  isPending = false,
}: {
  label: string;
  variant?: ButtonProps["variant"];
  isPending?: boolean;
}) {
  return (
    <Button
      type="submit"
      aria-disabled={isPending}
      disabled={isPending}
      className="space-y-0"
      variant={variant}
    >
      {label}
    </Button>
  );
}

export default function ReportFestivalForm({
  festivalId,
  reportTypeCategories,
  currentFestival,
  ratingQuestions,
  countries,
  currentReport,
}: {
  festivalId: number;
  reportTypeCategories: ReportTypeCategoriesType;
  currentFestival: FestivalByIdType;
  ratingQuestions: RatingQuestionsType;
  countries?: CountryByLocaleType;
  currentReport?: ReportFestivalType;
}) {
  useI18nZodErrors("reports.form.festival");

  console.log(currentReport);

  const router = useRouter();
  const t = useTranslations("reports");
  const tForm = useTranslations("reports.form.festival");
  const tRates = useTranslations("reports.form.rates");
  const locale = useLocale();
  const groupsConfirmed = currentFestival?.festivalsToGroups ?? [];
  const currentReportsSelectedGroups =
    currentReport?.ratingFestivalToGroups ?? [];

  const isCurrentReport = Boolean(currentReport?.id);

  const ratesValues = [
    tRates("zero"),
    tRates("one"),
    tRates("two"),
    tRates("three"),
    tRates("four"),
    tRates("five"),
  ];

  const form = useForm<z.infer<typeof formReportFestivalSchema>>({
    resolver: zodResolver(formReportFestivalSchema),
    defaultValues: {
      slug: "",
      festivalId,
      amountPeople: currentReport?.amountPeople ?? 0,
      disabledAdults: currentReport?.disabledAdults ?? 0,
      disabledYouth: currentReport?.disabledYouth ?? 0,
      disabledChildren: currentReport?.disabledChildren ?? 0,
      amountPerformances: currentReport?.amountPerformances ?? 0,
      averageCostTicket: currentReport?.averageCostTicket ?? 0,
      sourceData: currentReport?.sourceData ?? "",
      _typeActivitiesSelected: currentReport?.activities?.map((item) =>
        String(item.reportTypeCategoryId)
      )!,
      _isNonCioffGroups: !!currentReport?.nonGroups.length,
      _currentNonCioffGroups: currentReport?.nonGroups.at(0) ?? {
        howMany: 0,
        emailProvided: "",
      },
      _reportGroups: !currentReportsSelectedGroups.length
        ? groupsConfirmed.map((item) => ({
            id: item.groupId!,
            groupId: item.groupId,
            confirmed: true,
            ratingResult: "",
            name: item.group?.langs.find((lang) => lang?.l?.code === locale)
              ?.name,
            country: item.group?.country?.langs.find(
              (lang) => lang?.l?.code === locale
            )?.name,
            amountPersonsGroup: 0,
            _questions: ratingQuestions.map((question) => ({
              questionId: question.id,
              name: question.langs.find((lang) => lang.l.code === locale)
                ?.name!,
              rating: 0,
              comment: "",
            })),
          }))
        : currentReportsSelectedGroups.map((item) => ({
            id: item.groupId!,
            groupId: item.groupId,
            confirmed: groupsConfirmed.some(
              (group) => group.groupId === item.groupId
            ),
            ratingResult: item.ratingResult,
            generalComment: item.generalComment,
            name: item.group?.langs.find((lang) => lang?.l?.code === locale)
              ?.name,
            country: item.group?.country?.langs.find(
              (lang) => lang?.l?.code === locale
            )?.name,
            amountPersonsGroup: item.amountPersonsGroup ?? 0,
            isGroupLiveMusic: item.isGroupLiveMusic,
            isInvitationPerNs: item.isInvitationPerNs,
            isInvitationPerWebsite: item.isInvitationPerWebsite,
            _invitationThrough: item.isInvitationPerWebsite
              ? "isInvitationPerWebsite"
              : item.isInvitationPerNs
              ? "isInvitationPerNs"
              : "",
            _questions: item.answers.map((answer) => ({
              questionId: answer.ratingQuestionId,
              name: ratingQuestions
                .find((question) => question.id === answer.ratingQuestionId)
                ?.langs.find((lang) => lang.l.code === locale)?.name!,
              rating: answer.rating,
              comment: answer.comment,
            })),
          })),
    },
  });

  const {
    fields: currentReportGroups,
    append: appendCurrentReportGroups,
    remove: removeCurrentReportGroups,
  } = useFieldArray({
    control: form.control,
    name: "_reportGroups",
  });

  const currentIsNonCioffGroup = useWatch({
    control: form.control,
    name: "_isNonCioffGroups",
  });

  const currentCountrySelected = useWatch({
    control: form.control,
    name: "_countrySelected",
  });

  type CurrentGroups = Awaited<ReturnType<typeof buildGroup>>;

  const stateGroupFetch = useSWR<{ results: CurrentGroups }>(
    `/api/group?countryId=${currentCountrySelected ?? ""}`,
    fetcher
  );

  const { trigger, isMutating } = useSWRMutation(
    "/api/report/festival",
    insertReport,
    {
      onSuccess(data, _key, _config) {
        if (data) {
          if (data.success && data.reportId) {
            toast.success(data.success);
            customRevalidateTag("/dashboard/reports");
            router.push("/dashboard/reports");
          } else if (data.error) {
            toast.error(data.error);
          }
        }
      },
    }
  );

  async function onSubmit(values: z.infer<typeof formReportFestivalSchema>) {
    trigger(values);
  }

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold pb-10">
        {isCurrentReport
          ? `#REPORT-F-${currentReport?.id}`
          : tForm("addReportFromFestival")}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {tForm("reportFestivalDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{tForm("details")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="amountPeople"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of people</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isCurrentReport}
                              value={field.value ? String(field.value) : "0"}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Total number of people attended the festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="disabledAdults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of disabled adults</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isCurrentReport}
                              value={field.value ? String(field.value) : "0"}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Total number of disabled adults attended the
                            festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="disabledYouth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of disabled youth</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isCurrentReport}
                              value={field.value ? String(field.value) : "0"}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Total number of disabled youth attended the festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="disabledChildren"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of disabled children</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isCurrentReport}
                              value={field.value ? String(field.value) : "0"}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Total number of disabled children attended the
                            festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="amountPerformances"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of performances</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isCurrentReport}
                              value={field.value ? String(field.value) : "0"}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Total number of performances held during the
                            festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="averageCostTicket"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average cost of ticket</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isCurrentReport}
                              value={field.value ? String(field.value) : "0"}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Average cost of a ticket for the festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="sourceData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tForm("sourceData")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide the source of the data"
                            disabled={isCurrentReport}
                            className="resize-none"
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value ? String(field.value) : ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide the source of the data used in this report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("sideActivities")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Mention if you had activities additional to the main
                    performances
                  </p>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="_typeActivitiesSelected"
                    render={({ field }) => {
                      const options: MultiSelectProps["options"] =
                        reportTypeCategories.map((item) => ({
                          value: String(item.id),
                          label: item.langs.find(
                            (lang) => lang.l.code === locale
                          )?.name!,
                          caption: "",
                        }));
                      return (
                        <FormItem>
                          <FormControl>
                            <MultiSelect
                              options={options}
                              defaultValue={field.value}
                              disabled={isCurrentReport}
                              onValueChange={(values) => {
                                form.setValue(
                                  "_typeActivitiesSelected",
                                  values
                                );
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Select the activities that were present during the
                            festival
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full mx-auto mt-4">
            <CardHeader>
              <CardTitle>Report on the groups</CardTitle>
              <CardDescription>
                {tForm("reportFestivalDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <FormField
                    control={form.control}
                    name="_isNonCioffGroups"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>{tForm("nonCioffGroups")}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={isCurrentReport}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                {currentIsNonCioffGroup ? (
                  <div className="pl-5 border-l grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="_currentNonCioffGroups.howMany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{tForm("howMany")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={isCurrentReport}
                                onChange={(event) => {
                                  field.onChange(Number(event.target.value));
                                }}
                                onBlur={field.onBlur}
                                value={field.value ? Number(field.value) : 0}
                                name={field.name}
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
                        name="_currentNonCioffGroups.emailProvided"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{tForm("email")}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                disabled={isCurrentReport}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value ? String(field.value) : ""}
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription>
                              {tForm("provideEmail")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              {!isCurrentReport ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {t("evaluateOtherGroup")}
                  </h3>
                  <div>
                    <FormField
                      control={form.control}
                      name="_countrySelected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tForm("selectCountry")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={tForm("selectVerifiedCountry")}
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
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="_reportGroups"
                      render={({ field }) => {
                        const data = stateGroupFetch?.data?.results || [];
                        const options: MultiSelectProps["options"] =
                          data?.map((item) => ({
                            value: String(item.id) || "",
                            label:
                              item.langs.find((lang) => lang.l?.code === locale)
                                ?.name || "",
                            caption: "",
                          })) ?? [];
                        return (
                          <FormItem>
                            <Label>{tForm("selectGroups")}</Label>
                            <FormControl>
                              <MultiSelect
                                options={options}
                                defaultValue={
                                  field.value.map((item) =>
                                    String(item.groupId)
                                  ) || []
                                }
                                disabled={
                                  !currentCountrySelected ||
                                  stateGroupFetch.isLoading
                                }
                                hideSelectedValues
                                onValueChange={(values) => {
                                  const contents = values.map((item) => {
                                    return {
                                      name: data
                                        ?.find(
                                          (value) => value.id === Number(item)
                                        )
                                        ?.langs.find(
                                          (lang) => lang?.l?.code === locale
                                        )?.name!,
                                      country: countries
                                        ?.find(
                                          (country) =>
                                            country.id ===
                                            Number(currentCountrySelected)
                                        )
                                        ?.langs.find(
                                          (lang) => lang?.l?.code === locale
                                        )?.name!,
                                      id: Number(item),
                                      groupId: Number(item),
                                      confirmed: false,
                                      ratingResult: "",
                                      generalComment: "",
                                      amountPersonsGroup: 0,
                                      _questions: ratingQuestions.map(
                                        (question) => ({
                                          name: question.langs.find(
                                            (lang) => lang.l.code === locale
                                          )?.name!,
                                          questionId: question.id,
                                          rating: 0,
                                          comment: "",
                                        })
                                      ),
                                    };
                                  });

                                  const deprecateContents =
                                    currentReportGroups.filter((item) => {
                                      return !values.some(
                                        (value) =>
                                          value === String(item.groupId)
                                      );
                                    });

                                  if (deprecateContents.length) {
                                    const nextDeprecate: number[] = [];
                                    for (const deprecate of deprecateContents) {
                                      const index =
                                        currentReportGroups.findIndex(
                                          (item) =>
                                            item.groupId === deprecate.groupId
                                        );
                                      nextDeprecate.push(index);
                                    }

                                    removeCurrentReportGroups(nextDeprecate);
                                  }

                                  const nextContents = contents.filter(
                                    (value) =>
                                      !currentReportGroups.some(
                                        (festival) =>
                                          festival.groupId ===
                                          Number(value.groupId)
                                      )
                                  );
                                  appendCurrentReportGroups(nextContents);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              ) : null}
              <div className="space-y-4">
                {currentReportGroups.map((item, index) => {
                  return (
                    <Card key={item.id} className="w-full">
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <div className="flex justify-between">
                          <CardDescription>{item.country}</CardDescription>
                          {item.confirmed ? (
                            <Badge variant="secondary">Confirmed</Badge>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">
                          {tForm("reportQuestions")}
                        </h3>
                        <div className="grid space-y-4">
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportGroups.${index}._invitationThrough`}
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel>
                                    How did you invite this group?
                                  </FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(value) => {
                                        if (
                                          value === "isInvitationPerWebsite"
                                        ) {
                                          form.setValue(
                                            `_reportGroups.${index}.isInvitationPerWebsite`,
                                            true
                                          );
                                          form.setValue(
                                            `_reportGroups.${index}.isInvitationPerNs`,
                                            false
                                          );
                                        }
                                        if (value === "isInvitationPerNs") {
                                          form.setValue(
                                            `_reportGroups.${index}.isInvitationPerWebsite`,
                                            false
                                          );
                                          form.setValue(
                                            `_reportGroups.${index}.isInvitationPerNs`,
                                            true
                                          );
                                        }
                                        field.onChange(value);
                                      }}
                                      defaultValue={field.value}
                                      disabled={isCurrentReport}
                                      className="flex flex-col space-y-1"
                                    >
                                      <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value="isInvitationPerWebsite" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          Through the website
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value="isInvitationPerNs" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          Through the NS
                                        </FormLabel>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportGroups.${index}.amountPersonsGroup`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    How many persons did the group bring?
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      disabled={isCurrentReport}
                                      value={
                                        field.value ? String(field.value) : "0"
                                      }
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Please provide the number of persons the
                                    group
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid space-y-4">
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportGroups.${index}.isGroupLiveMusic`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>
                                      {tForm("bringLiveMusic")}
                                    </FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      disabled={isCurrentReport}
                                      checked={!!field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold mb-4">
                            {tForm("rating")}
                          </h3>
                          <div className="space-y-4">
                            {item._questions.map(
                              (itemQuestion, indexQuestion) => (
                                <div
                                  key={`${item.id}-${itemQuestion.name}`}
                                  className="space-y-2"
                                >
                                  <h5 className="text-sm font-bold">
                                    {itemQuestion.name}
                                  </h5>
                                  <FormField
                                    control={form.control}
                                    name={`_reportGroups.${index}._questions.${indexQuestion}.rating`}
                                    render={({ field }) => {
                                      return (
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroup
                                              onValueChange={(value) => {
                                                field.onChange(Number(value));
                                              }}
                                              disabled={isCurrentReport}
                                              defaultValue={`${field.value}`}
                                            >
                                              <div className="flex justify-between">
                                                {ratesValues.map((rating) => (
                                                  <FormItem
                                                    key={rating}
                                                    className="flex items-center space-y-0"
                                                  >
                                                    <FormControl>
                                                      <RadioGroupItem
                                                        value={
                                                          rating.split(" - ")[0]
                                                        }
                                                        id={`${itemQuestion.name}-${rating}`}
                                                      />
                                                    </FormControl>
                                                    <FormLabel
                                                      htmlFor={`${itemQuestion.name}-${rating}`}
                                                      className="ml-2 text-sm"
                                                    >
                                                      {rating}
                                                    </FormLabel>
                                                  </FormItem>
                                                ))}
                                              </div>
                                            </RadioGroup>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      );
                                    }}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`_reportGroups.${index}._questions.${indexQuestion}.comment`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {tForm("comment")}
                                        </FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder={tForm(
                                              "commentPlaceholder"
                                            )}
                                            disabled={isCurrentReport}
                                            className="resize-none"
                                            defaultValue={field.value ?? ""}
                                            onChange={(e) =>
                                              field.onChange(e.target.value)
                                            }
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          {tForm("commentDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="grid-space-y-4">
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportGroups.${index}.generalComment`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-lg font-semibold">
                                    {tForm("generalComment")}
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      className="resize-none"
                                      disabled={isCurrentReport}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      value={
                                        field.value ? String(field.value) : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {tForm("commentDescription")}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {!isCurrentReport ? (
            <div className="sticky bottom-5 mt-4 right-0 flex justify-end px-4">
              <Card className="flex justify-end gap-4 w-full">
                <CardContent className="flex-row items-center p-4 flex w-full justify-end">
                  <div className="flex gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/dashboard/festivals">Cancel</Link>
                    </Button>
                    <Submit label="Save" isPending={isMutating} />
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
