"use client";

import { UserDataAuthType } from "@/db/queries";
import { CountByCountriesResult } from "@/db/queries/reports";
import {
  insertActivitySchema,
  insertReportNationalSectionLangSchema,
  insertReportNationalSectionsSchema,
} from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { PlusCircle } from "lucide-react";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { customRevalidateTag } from "../revalidateTag";
import { useTranslations } from "next-intl";

async function insertReport(
  url: string,
  { arg }: { arg: z.infer<typeof formReportNationalSectionSchema> },
) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((response) => response.json());
}

export const formReportNationalSectionSchema =
  insertReportNationalSectionsSchema.merge(
    z.object({
      _activities: z.array(insertActivitySchema),
      _lang: insertReportNationalSectionLangSchema,
    }),
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

export default function ReportNationalSectionForm({
  user,
  counts,
}: {
  user: UserDataAuthType;
  counts: CountByCountriesResult;
}) {
  const router = useRouter();

  // React Hook Form + Zod + Shadcn
  const form = useForm<z.infer<typeof formReportNationalSectionSchema>>({
    resolver: zodResolver(formReportNationalSectionSchema),
    defaultValues: {
      festivalSize: counts.festivalCount,
      groupSize: counts.groupCount,
      _activities: [{}],
    },
  });

  const t = useTranslations("form.festival");

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "_activities",
  });

  const { trigger, isMutating } = useSWRMutation(
    "/api/report/national-section",
    insertReport,
    {
      onSuccess(data, key, config) {
        if (data) {
          customRevalidateTag("/dashboard/festivals");
          router.push("/dashboard/festivals");
          console.log({ data });
        }
      },
    },
  );

  async function onSubmit(
    values: z.infer<typeof formReportNationalSectionSchema>,
  ) {
    trigger(values);
  }

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold">ADD A REPORT FROM NATIONAL SECTION</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
        {t("directorName")}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Module: Reports</CardTitle>
              <CardDescription>
                Please fill out the following information about your
                organization and activities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Members</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="festivalSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of festivals</FormLabel>
                          <FormControl>
                            <Input
                              defaultValue={String(field.value)}
                              readOnly
                            />
                          </FormControl>
                          <FormDescription>
                            Extract from the number of festivals profiles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="groupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of groups</FormLabel>
                          <FormControl>
                            <Input
                              defaultValue={String(field.value)}
                              readOnly
                            />
                          </FormControl>
                          <FormDescription>
                            Extract from the number of groups profiles
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
                    name="associationSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Number of associations or other organizations
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={
                            field.value ? String(field.value) : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger
                              ref={field.ref}
                              onBlur={field.onBlur}
                            >
                              <SelectValue placeholder="Select a number of associations" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem key={i} value={`${i + 1}`}>
                                {i + 1}
                              </SelectItem>
                            ))}
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
                    name="individualMemberSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of individual members</FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            type="number"
                            onChange={(value) =>
                              field.onChange(Number(value.target.value))
                            }
                            onBlur={field.onBlur}
                            value={String(field.value ?? 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Add the number size of members
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Cooperation with UNESCO
                </h3>
                <div>
                  <FormField
                    control={form.control}
                    name="activeNationalCommission"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Are you actively engaged with your National
                          Commission?..
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) =>
                              field.onChange(value === "yes")
                            }
                            defaultValue={field.value ? "yes" : "no"}
                            ref={field.ref}
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
                <div>
                  <FormField
                    control={form.control}
                    name="_lang.workDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How did you work with them this year"
                            className="resize-none"
                            onChange={(value) =>
                              field.onChange(value.target.value)
                            }
                            defaultValue={field.value || undefined}
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cultural activities</h3>
                <p className="text-sm text-muted-foreground">
                  Please list all the activities held by your NS. Don't list
                  international festivals.
                </p>
                {fields.map((field, index) => {
                  return (
                    <Card key={field.id}>
                      <CardHeader>
                        <CardTitle>Activity {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <FormField
                            control={form.control}
                            name={`_activities.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Choose type of activity</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={
                                    field.value
                                      ? String(field.value)
                                      : undefined
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      ref={field.ref}
                                      onBlur={field.onBlur}
                                    >
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Conference">
                                      Conference
                                    </SelectItem>
                                    <SelectItem value="Workshop">
                                      Workshop
                                    </SelectItem>
                                    <SelectItem value="Seminar">
                                      Seminar
                                    </SelectItem>
                                    <SelectItem value="Congress">
                                      Congress
                                    </SelectItem>
                                    <SelectItem
                                      value="National Festival"
                                      title="Only if it was
                                      organized by the NS"
                                    >
                                      National festival
                                    </SelectItem>
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
                            name={`_activities.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Activity name/title</FormLabel>
                                <FormControl>
                                  <Input
                                    ref={field.ref}
                                    onChange={(value) =>
                                      field.onChange(value.target.value)
                                    }
                                    value={field.value ?? undefined}
                                    onBlur={field.onBlur}
                                    placeholder="Type the name of the activity"
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
                            name={`_activities.${index}.modality`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Choose modality of activity
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={
                                    field.value
                                      ? String(field.value)
                                      : undefined
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      ref={field.ref}
                                      onBlur={field.onBlur}
                                    >
                                      <SelectValue placeholder="Select modality" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="In Person">
                                      In person
                                    </SelectItem>
                                    <SelectItem value="Online">
                                      Online
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`activity-length-${index}`}>
                            Length
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`_activities.${index}.length`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={
                                      field.value
                                        ? String(field.value)
                                        : undefined
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                      >
                                        <SelectValue placeholder="Select unit" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Hours">
                                        Hours
                                      </SelectItem>
                                      <SelectItem value="Days">Days</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`_activities.${index}.lengthSize`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number(value))
                                    }
                                    defaultValue={
                                      field.value
                                        ? String(field.value)
                                        : undefined
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                      >
                                        <SelectValue placeholder="Select number" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[...Array(10)].map((_, i) => (
                                        <SelectItem key={i} value={`${i + 1}`}>
                                          {i + 1}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name={`_activities.${index}.performerSize`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Number of speakers/performers
                                </FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(Number(value))
                                  }
                                  defaultValue={
                                    field.value
                                      ? String(field.value)
                                      : undefined
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      ref={field.ref}
                                      onBlur={field.onBlur}
                                    >
                                      <SelectValue placeholder="Select number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[...Array(10)].map((_, i) => (
                                      <SelectItem key={i} value={`${i + 1}`}>
                                        {i + 1}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <Button type="button" onClick={() => append({ name: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                </Button>
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
                  <Submit label="Save" isPending={isMutating} />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
