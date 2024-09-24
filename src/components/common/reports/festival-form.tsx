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

export default function ReportFestivalForm({
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
      <h1 className="text-2xl font-bold">ADD A REPORT FROM FESTIVAL</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Module 1: Festival general report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="attendees">
                  How many people did attend to your festival this year?
                </Label>
                <Input id="attendees" type="number" />
              </div>

              <div>
                <Label>Did you have people with disabilities</Label>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disabilities-yes" />
                    <Label htmlFor="disabilities-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disabilities-no" />
                    <Label htmlFor="disabilities-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Can you tell about their age?</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="adults" />
                    <Label htmlFor="adults">Adults</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="youth" />
                    <Label htmlFor="youth">Youth/Teenagers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="children" />
                    <Label htmlFor="children">Children</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="source">
                  What is the source of this figure?
                </Label>
                <Input id="source" />
              </div>

              <div>
                <Label>Did you have any paid shows?</Label>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="paid-shows-yes" />
                    <Label htmlFor="paid-shows-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="paid-shows-no" />
                    <Label htmlFor="paid-shows-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Side activities</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="conferences" />
                    <Label htmlFor="conferences">Conferences</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="workshops" />
                    <Label htmlFor="workshops">Workshops</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="crafts-fair" />
                    <Label htmlFor="crafts-fair">Crafts fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="gastronomy" />
                    <Label htmlFor="gastronomy">Gastronomy fair/display</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module 2: Festival report on the groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Warning: Please enter your answers in French, English or
                Spanish, reports entered in another language will not be
                considered!
              </p>

              <div>
                <Label>Did you have non-CIOFF groups?</Label>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="non-cioff-yes" />
                    <Label htmlFor="non-cioff-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="non-cioff-no" />
                    <Label htmlFor="non-cioff-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="how-many">How many</Label>
                <Input id="how-many" type="number" />
              </div>

              <div>
                <Label htmlFor="email">Provide email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Send email with Google Forms"
                />
              </div>

              <div>
                <Label htmlFor="country">Choose a country</Label>
                <Select>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="country1">Country 1</SelectItem>
                    <SelectItem value="country2">Country 2</SelectItem>
                    {/* Add more countries as needed */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="group">Choose a group</Label>
                <Select>
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group1">Group 1</SelectItem>
                    <SelectItem value="group2">Group 2</SelectItem>
                    {/* Add more groups as needed */}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating section */}
              {[
                "Music",
                "Singing",
                "Performances",
                "Costumes",
                "General artistic level",
                "Group behavior",
                "Cooperation of the people in charge",
              ].map((category) => (
                <div key={category} className="space-y-2">
                  <Label>{category}</Label>
                  <RadioGroup>
                    <div className="flex justify-between">
                      {[
                        "0 - Non applicable",
                        "1 - Bad",
                        "2 - Weak",
                        "3 - Good",
                        "4 - Very good",
                        "5 - Excellent",
                      ].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <RadioGroupItem
                            value={rating}
                            id={`${category}-${rating}`}
                          />
                          <Label
                            htmlFor={`${category}-${rating}`}
                            className="ml-2 text-sm"
                          >
                            {rating.split(" - ")[0]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  <Textarea placeholder="Comments (Max 300 words)" />
                </div>
              ))}

              <div>
                <Label htmlFor="general-comment">
                  General comment on the group
                </Label>
                <Textarea id="general-comment" placeholder="Max 300 words" />
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
