"use client";

import { UserDataAuthType } from "@/db/queries";
import {
  RatingQuestionsType,
  ReportGroupType,
  ReportTypeCategoriesType,
} from "@/db/queries/reports";
import {
  insertRatingGroupToFestivalsAnswersSchema,
  insertRatingGroupToFestivalsSchema,
  insertReportGroupSchema,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { customRevalidateTag } from "../revalidateTag";
import { Checkbox } from "@/components/ui/checkbox";
import { GroupDetailsType } from "@/db/queries/groups";
import { useLocale, useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { CountryByLocaleType } from "@/db/queries/countries";
import { buildFestival } from "@/db/queries/events";
import useSWR from "swr";
import fetcher from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { useEffect, useState } from "react";

async function insertReport(
  url: string,
  { arg }: { arg: z.infer<typeof formReportGroupSchema> }
) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((response) => response.json());
}

export const formReportGroupSchema = insertReportGroupSchema.merge(
  z.object({
    _shouldDraft: z.boolean().optional(),
    _isInscribedICH: z.boolean().optional(),
    _countrySelected: z.string().optional(),
    _reportFestivals: z.array(
      insertRatingGroupToFestivalsSchema.omit({ reportGroupId: true }).merge(
        z.object({
          name: z.string(),
          country: z.string(),
          confirmed: z.boolean(),
          _typeActivitiesLocalesSelected: z.array(z.string()),
          _typeActivitiesSleepsSelected: z.array(z.string()),
          _questions: z.array(
            insertRatingGroupToFestivalsAnswersSchema
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
                  params: { i18n: "mandatory_rating_comment_1" },
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

export default function ReportGroupForm({
  user,
  currentGroup,
  ratingQuestions,
  countries,
  reportTypeCategoriesLocales,
  reportTypeCategoriesSleeps,
  currentReport,
}: {
  user: UserDataAuthType;
  currentGroup: GroupDetailsType;
  ratingQuestions: RatingQuestionsType;
  reportTypeCategoriesLocales: ReportTypeCategoriesType;
  reportTypeCategoriesSleeps: ReportTypeCategoriesType;
  countries?: CountryByLocaleType;
  currentReport?: ReportGroupType;
}) {
  useI18nZodErrors("reports.form.group");

  const [loadingToastId, setLoadingToastId] = useState<string | number>(0);
  const router = useRouter();
  const t = useTranslations("reports");
  const tForm = useTranslations("reports.form.group");
  const tRates = useTranslations("reports.form.rates");
  const locale = useLocale();
  const festivalsConfirmed = currentGroup?.festivalsToGroups ?? [];
  const currentReportSelectedFestivals =
    currentReport?.ratingGroupToFestivals ?? [];

  const isDraft = Boolean(currentReport?.draft);
  const isCurrentReport = Boolean(currentReport?.id) && !isDraft;

  const ratesValues = [
    tRates("one"),
    tRates("two"),
    tRates("three"),
    tRates("four"),
    tRates("five"),
  ];

  const form = useForm<z.infer<typeof formReportGroupSchema>>({
    resolver: zodResolver(formReportGroupSchema),
    defaultValues: {
      groupId: currentGroup?.id!,
      _shouldDraft: false,
      amountPersonsTravelled: currentReport?.amountPersonsTravelled ?? 0,
      ich: currentReport?.ich ?? "",
      _isInscribedICH: !!currentReport?.ich,
      _reportFestivals: !currentReportSelectedFestivals.length
        ? festivalsConfirmed.map((item) => ({
            id: item.festivalId!,
            festivalId: item.festivalId,
            confirmed: true,
            ratingResult: "",
            generalComment: "",
            atLeast5ForeginGroups: false,
            introductionBeforePerformances: false,
            festivalCoverTravelCosts: false,
            refreshmentsDuringPerformances: false,
            inKindCompensation: "",
            financialCompensation: 0,
            typeOfCompensation: "",
            _typeActivitiesLocalesSelected: [],
            _typeActivitiesSleepsSelected: [],
            name:
              item.festival?.langs.find((lang) => lang?.l?.code === locale)
                ?.name || item.festival?.langs.at(0)?.name,
            country: item.festival?.country?.langs.find(
              (lang) => lang?.l?.code === locale
            )?.name,
            _questions: ratingQuestions.map((question) => ({
              questionId: question.id,
              name: question.langs.find((lang) => lang.l.code === locale)
                ?.name!,
              rating: 1,
              comment: "",
            })),
          }))
        : currentReportSelectedFestivals.map((item) => ({
            id: item.festivalId!,
            festivalId: item.festivalId,
            confirmed: festivalsConfirmed.some(
              (festival) => festival.festivalId === item.festivalId
            ),
            ratingResult: item.ratingResult,
            generalComment: item.generalComment,
            atLeast5ForeginGroups: item.atLeast5ForeginGroups,
            introductionBeforePerformances: item.introductionBeforePerformances,
            festivalCoverTravelCosts: item.festivalCoverTravelCosts,
            refreshmentsDuringPerformances: item.refreshmentsDuringPerformances,
            inKindCompensation: item.inKindCompensation,
            financialCompensation: item.financialCompensation,
            typeOfCompensation: item.typeOfCompensation,
            _typeActivitiesLocalesSelected: item.reportGroupTypeLocales.map(
              (item) => String(item.reportTypeCategoryId)
            ),
            _typeActivitiesSleepsSelected: item.reportGroupTypeLocalesSleep.map(
              (item) => String(item.reportTypeCategoryId)
            ),
            name: item.festival?.langs.find((lang) => lang?.l?.code === locale)
              ?.name,
            country: item.festival?.country?.langs.find(
              (lang) => lang?.l?.code === locale
            )?.name,
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
    fields: currentReportFestivals,
    append: appendCurrentReportFestivals,
    remove: removeCurrentReportFestivals,
  } = useFieldArray({
    control: form.control,
    name: "_reportFestivals",
  });

  const currentIsInscribedICH = useWatch({
    control: form.control,
    name: "_isInscribedICH",
  });

  const currentCountrySelected = useWatch({
    control: form.control,
    name: "_countrySelected",
  });

  type CurrentFestivals = Awaited<ReturnType<typeof buildFestival>>;

  const stateFestivalFetch = useSWR<{ results: CurrentFestivals }>(
    `/api/festival?countryId=${currentCountrySelected ?? ""}`,
    fetcher
  );

  const { trigger, isMutating } = useSWRMutation(
    isDraft
      ? `/api/report/group/edit?reportId=${currentReport?.id}`
      : "/api/report/group",
    insertReport,
    {
      onSuccess(data, _key, _config) {
        if (data) {
          if (data.success && data.reportId) {
            toast.success(data.success);
            customRevalidateTag("/dashboard/reports");
            toast.dismiss();
            router.push("/dashboard/reports");
          } else if (data.error) {
            toast.error(data.error);
          }
        }
      },
    }
  );

  useEffect(() => {
    if (isMutating && !loadingToastId) {
      setLoadingToastId(toast.loading(tForm("savingReport")));
    } else if (!isMutating && loadingToastId) {
      toast.dismiss(loadingToastId);
      setLoadingToastId(0);
    }
  }, [isMutating, tForm, loadingToastId]);

  async function onSubmit(values: z.infer<typeof formReportGroupSchema>) {
    trigger(values);
  }

  function onDraft() {
    const formData = form.getValues();
    formData._shouldDraft = true;
    trigger(formData);
  }

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold pb-10">
        {currentReport?.id || currentReport?.draft
          ? `#REPORT-G-${currentReport?.id}`
          : tForm("addReportFromGroup")}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {tForm("reportGroupDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {tForm("generalReport")}
                </h2>
                <div>
                  <FormField
                    control={form.control}
                    name="amountPersonsTravelled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {tForm("personGroupTravelledThisYear")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isCurrentReport}
                            value={field.value ? String(field.value) : ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {tForm("totalPeopleTravelledGroup")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="_isInscribedICH"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>{tForm("inscribedICH")}</FormLabel>
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
                {currentIsInscribedICH ? (
                  <div className="pl-5 border-l grid gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="ich"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{tForm("name")}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={isCurrentReport}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value ? String(field.value) : ""}
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription>
                              {tForm("provideNameICH")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card className="w-full mx-auto mt-4">
            <CardHeader>
              <CardTitle>{tForm("groupReportFestival")}</CardTitle>
              <CardDescription>
                {tForm("reportGroupDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {!isCurrentReport ? (
                  <>
                    <h3 className="text-lg font-semibold">
                      {t("evaluateOtherFestival")}
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
                        name="_reportFestivals"
                        render={({ field }) => {
                          const data = stateFestivalFetch?.data?.results || [];
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
                              <Label>{tForm("selectFestivals")}</Label>
                              <FormControl>
                                <MultiSelect
                                  options={options}
                                  placeholder={tForm("selectOptions")}
                                  defaultValue={
                                    field.value.map((item) =>
                                      String(item.festivalId)
                                    ) || []
                                  }
                                  disabled={
                                    !currentCountrySelected ||
                                    stateFestivalFetch.isLoading
                                  }
                                  hideSelectedValues
                                  onValueChange={(values) => {
                                    const contents = values.map((item) => {
                                      return {
                                        name:
                                          data
                                            ?.find(
                                              (value) =>
                                                value.id === Number(item)
                                            )
                                            ?.langs.find(
                                              (lang) => lang?.l?.code === locale
                                            )?.name! ||
                                          data
                                            ?.find(
                                              (value) =>
                                                value.id === Number(item)
                                            )
                                            ?.langs.at(0)?.name!,
                                        country:
                                          countries
                                            ?.find(
                                              (country) =>
                                                country.id ===
                                                Number(currentCountrySelected)
                                            )
                                            ?.langs.find(
                                              (lang) => lang?.l?.code === locale
                                            )?.name! ||
                                          countries
                                            ?.find(
                                              (country) =>
                                                country.id ===
                                                Number(currentCountrySelected)
                                            )
                                            ?.langs.at(0)?.name!,
                                        id: Number(item),
                                        festivalId: Number(item),
                                        confirmed: false,
                                        ratingResult: "",
                                        generalComment: "",
                                        _typeActivitiesLocalesSelected: [],
                                        _typeActivitiesSleepsSelected: [],
                                        _questions: ratingQuestions.map(
                                          (question) => ({
                                            name: question.langs.find(
                                              (lang) => lang.l.code === locale
                                            )?.name!,
                                            questionId: question.id,
                                            rating: 1,
                                            comment: "",
                                          })
                                        ),
                                      };
                                    });

                                    const deprecateContents =
                                      currentReportFestivals.filter((item) => {
                                        return !values.some(
                                          (value) =>
                                            value === String(item.festivalId)
                                        );
                                      });

                                    if (deprecateContents.length) {
                                      const nextDeprecate: number[] = [];
                                      for (const deprecate of deprecateContents) {
                                        const index =
                                          currentReportFestivals.findIndex(
                                            (item) =>
                                              item.festivalId ===
                                              deprecate.festivalId
                                          );
                                        nextDeprecate.push(index);
                                      }

                                      removeCurrentReportFestivals(
                                        nextDeprecate
                                      );
                                    }

                                    const nextContents = contents.filter(
                                      (value) =>
                                        !currentReportFestivals.some(
                                          (festival) =>
                                            festival.festivalId ===
                                            Number(value.festivalId)
                                        )
                                    );
                                    appendCurrentReportFestivals(nextContents);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </div>
              <div className="space-y-4">
                {currentReportFestivals.map((item, index) => {
                  return (
                    <Card key={item.id} className="w-full">
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <div className="flex justify-between">
                          <CardDescription>{item.country}</CardDescription>
                          <div className="flex gap-2 items-center">
                            {item.confirmed ? (
                              <Badge variant="secondary">
                                {tForm("confirmed")}
                              </Badge>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                removeCurrentReportFestivals(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">
                          {tForm("reportQuestions")}
                        </h3>
                        <div className="grid space-y-4">
                          {/* Report Questions */}
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}.introductionBeforePerformances`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>
                                      {tForm("introductionPerformance")}
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
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}.atLeast5ForeginGroups`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>
                                      {tForm("leastFiveForeignGroups")}
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
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}.festivalCoverTravelCosts`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>{tForm("travelCost")}</FormLabel>
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
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}.refreshmentsDuringPerformances`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>
                                      {tForm("refreshmentsPerformance")}
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
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}.typeOfCompensation`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {tForm("type_compensation")}
                                  </FormLabel>
                                  <Select
                                    disabled={isCurrentReport}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value ?? ""}
                                    name={field.name}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={tForm(
                                            "select_type_compensation_display"
                                          )}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="financial">
                                        {tForm("financial_compensation")}
                                      </SelectItem>
                                      <SelectItem value="in-kind">
                                        {tForm("in_kind_compensation")}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    {tForm("you_can_manage_type_compensation")}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {form.watch(
                            `_reportFestivals.${index}.typeOfCompensation`
                          ) === "financial" ? (
                            <div className="pl-5 border-l grid gap-4">
                              <FormField
                                control={form.control}
                                name={`_reportFestivals.${index}.financialCompensation`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder={tForm("howMuch")}
                                        type="number"
                                        disabled={isCurrentReport}
                                        value={
                                          field.value ? String(field.value) : ""
                                        }
                                        onChange={(e) =>
                                          field.onChange(Number(e.target.value))
                                        }
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {tForm("provideValueRequired")}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}
                          {form.watch(
                            `_reportFestivals.${index}.typeOfCompensation`
                          ) === "in-kind" ? (
                            <div className="pl-5 border-l grid gap-4">
                              <FormField
                                control={form.control}
                                name={`_reportFestivals.${index}.inKindCompensation`}
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        disabled={isCurrentReport}
                                        value={field.value || ""}
                                        placeholder={tForm(
                                          "provideInkindCompensation"
                                        )}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {tForm("provideValueRequired")}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}
                        </div>
                        <div className="grid space-y-4">
                          {/* Locales/Sleep */}
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}._typeActivitiesLocalesSelected`}
                              render={({ field }) => {
                                const options: MultiSelectProps["options"] =
                                  reportTypeCategoriesLocales.map((item) => ({
                                    value: String(item.id),
                                    label: item.langs.find(
                                      (lang) => lang.l.code === locale
                                    )?.name!,
                                    caption: "",
                                  }));
                                return (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("localePerform")}
                                    </FormLabel>
                                    <FormControl>
                                      <MultiSelect
                                        options={options}
                                        disabled={isCurrentReport}
                                        defaultValue={field.value}
                                        onValueChange={(values) => {
                                          field.onChange(values);
                                        }}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {tForm("selectActivitiesPresentFestival")}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`_reportFestivals.${index}._typeActivitiesSleepsSelected`}
                              render={({ field }) => {
                                const options: MultiSelectProps["options"] =
                                  reportTypeCategoriesSleeps.map((item) => ({
                                    value: String(item.id),
                                    label: item.langs.find(
                                      (lang) => lang.l.code === locale
                                    )?.name!,
                                    caption: "",
                                  }));
                                return (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("sleepPerform")}
                                    </FormLabel>
                                    <FormControl>
                                      <MultiSelect
                                        options={options}
                                        disabled={isCurrentReport}
                                        defaultValue={field.value}
                                        onValueChange={(values) => {
                                          field.onChange(values);
                                        }}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {tForm("selectLocalesPresenteSleep")}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
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
                                    {ratingQuestions
                                      .find(
                                        (question) =>
                                          question.id ===
                                          itemQuestion.questionId
                                      )
                                      ?.langs.find(
                                        (lang) => lang.l.code === locale
                                      )?.name ||
                                      ratingQuestions
                                        .find(
                                          (question) =>
                                            question.id ===
                                            itemQuestion.questionId
                                        )
                                        ?.langs.at(0)?.name}
                                  </h5>
                                  <FormField
                                    control={form.control}
                                    name={`_reportFestivals.${index}._questions.${indexQuestion}.rating`}
                                    render={({ field }) => {
                                      return (
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroup
                                              disabled={isCurrentReport}
                                              onValueChange={(value) => {
                                                field.onChange(Number(value));
                                              }}
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
                                    name={`_reportFestivals.${index}._questions.${indexQuestion}.comment`}
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
                              name={`_reportFestivals.${index}.generalComment`}
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
                    <Button variant="ghost" asChild disabled={isMutating}>
                      <Link href="/dashboard/reports">{tForm("cancel")}</Link>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onDraft}
                      disabled={isMutating}
                    >
                      {tForm("save")}
                    </Button>
                    <Submit label={tForm("submit")} isPending={isMutating} />
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
