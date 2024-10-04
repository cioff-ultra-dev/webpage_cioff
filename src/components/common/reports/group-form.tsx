"use client";

import { UserDataAuthType } from "@/db/queries";
import { CountByCountriesResult } from "@/db/queries/reports";
import {
  insertActivitySchema,
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
import { Checkbox } from "@/components/ui/checkbox";

async function insertReport(
  url: string,
  { arg }: { arg: z.infer<typeof formReportNationalSectionSchema> }
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
  counts,
}: {
  user: UserDataAuthType;
  counts: CountByCountriesResult;
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formReportNationalSectionSchema>>({
    resolver: zodResolver(formReportNationalSectionSchema),
    defaultValues: {
      festivalSize: counts.festivalCount,
      groupSize: counts.groupCount,
      _activities: [{}],
    },
  });

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
    }
  );

  async function onSubmit(
    values: z.infer<typeof formReportNationalSectionSchema>
  ) {
    trigger(values);
  }

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold">ADD A REPORT FROM GROUP</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full mx-auto pt-8">
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Module 1: Group general report
                  </h2>
                  <div>
                    <Label htmlFor="group-members">
                      How many persons has your group traveled this year?
                    </Label>
                    <Input id="group-members" type="number" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="represented-country" />
                    <Label htmlFor="represented-country">
                      Did you represent an inscribed ICH element from your
                      country?
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Module 2: Group report on the festivals
                  </h2>
                  <div>
                    <Label htmlFor="country">Choose a country</Label>
                    <Select>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="country1">Country 1</SelectItem>
                        <SelectItem value="country2">Country 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="festival">Choose a festival</Label>
                    <Select>
                      <SelectTrigger id="festival">
                        <SelectValue placeholder="Select festival" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="festival1">Festival 1</SelectItem>
                        <SelectItem value="festival2">Festival 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Report questions</h2>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cioff-instruction" />
                    <Label htmlFor="cioff-instruction">
                      Does the festival have CIOFF instruction before?
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cioff-logo" />
                    <Label htmlFor="cioff-logo">
                      Did the festival use CIOFF logos or flag during the
                      program?
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="foreign-groups" />
                    <Label htmlFor="foreign-groups">
                      Did the festival host at least 5 foreign groups?
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Ratings</h2>
                  {[
                    "Food",
                    "Accommodation",
                    "Sound",
                    "Light",
                    "Stages and floor",
                    "Dressing rooms and toilets",
                    "Rest time",
                    "Cultural visits and activities",
                    "Exchanges and meetings with other groups",
                    "Exchanges and meetings with local people",
                    "Level of organization",
                    "Artistic level of the festival",
                  ].map((item) => (
                    <div key={item} className="space-y-2">
                      <Label>{item}</Label>
                      <RadioGroup defaultValue="3" className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div
                            key={value}
                            className="flex items-center space-x-1"
                          >
                            <RadioGroupItem
                              value={value.toString()}
                              id={`${item}-${value}`}
                            />
                            <Label htmlFor={`${item}-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <Textarea placeholder="Comments" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    General comment on the festival
                  </h2>
                  <Textarea placeholder="Max 300 words" />
                </div>

                <Button type="submit">Submit Evaluation</Button>
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
