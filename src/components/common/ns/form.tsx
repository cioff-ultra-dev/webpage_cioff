"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { createFestival } from "@/app/actions";
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
import { insertFestivalSchema } from "@/db/schema";
import { AutocompletePlaces } from "@/components/ui/autocomplete-places";
import MapHandler from "@/components/common/map-handler";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addYears, endOfYear, format, startOfYear, subYears } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const globalEventSchema = insertFestivalSchema.merge(
  z.object({
    _currentDates: z.array(z.date()).nonempty(),
    _nextDates: z.array(z.date()),
  })
);

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

export default function NationalSectionForm() {
  const [state, formAction] = useFormState(createFestival, undefined);
  const [festivals, setFestivals] = useState([{ id: 1 }]);
  const [groups, setGroups] = useState([{ id: 1 }]);

  const addFestival = () => {
    setFestivals([...festivals, { id: festivals.length + 1 }]);
  };

  const addGroup = () => {
    setGroups([...groups, { id: groups.length + 1 }]);
  };

  const removeFestival = (id: number) => {
    setFestivals(festivals.filter((festival) => festival.id !== id));
  };

  const removeGroup = (id: number) => {
    setGroups(groups.filter((group) => group.id !== id));
  };

  const form = useForm<z.infer<typeof globalEventSchema>>({
    resolver: zodResolver(globalEventSchema),
    defaultValues: {},
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="w-full p-4 md:p-6 ">
      <h1 className="text-2xl font-bold">ADD A NATIONAL SECTION</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
      </p>
      <Form {...form}>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(evt) => {
            evt.preventDefault();
            form.handleSubmit((_) => {
              console.log(formRef.current);
            })(evt);
          }}
        >
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
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">Name of the association</Label>
                  <Input id="name" placeholder="Enter association name" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="about">About National Section</Label>
                  <Textarea
                    id="about"
                    placeholder="Tell the public about the NS main activities or projects, year of creation, etc."
                  />
                </div>
              </div>

              {[1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
                <div key={position} className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Position {position}</h3>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`name-${position}`}>Name</Label>
                    <Input
                      id={`name-${position}`}
                      placeholder="Imported from DB"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`photo-${position}`}>Photo</Label>
                    <Input id={`photo-${position}`} type="file" />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`short-bio-${position}`}>Short bio</Label>
                    <Textarea
                      id={`short-bio-${position}`}
                      placeholder="200 words"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id={`private-${position}`} />
                    <Label htmlFor={`private-${position}`}>
                      Private - only NS and Council users
                    </Label>
                  </div>
                  <Button variant="outline">See contact information</Button>
                </div>
              ))}

              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">
                  About Youth Commission
                </h2>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="youth-commission">
                    CISFF International Honorary Members
                  </Label>
                  <Textarea
                    id="youth-commission"
                    placeholder="Enter details about youth commission"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Social media</h2>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" placeholder="Enter Facebook URL" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="Enter Instagram URL" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="Enter Website URL" />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Other events</h2>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="other-events">Name of the event</Label>
                  <Input id="other-events" placeholder="Enter event name" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="event-description">Short description</Label>
                  <Textarea
                    id="event-description"
                    placeholder="Max 400 words"
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
                {festivals.map((festival) => (
                  <div
                    key={festival.id}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={`festival-name-${festival.id}`}>
                        Name of the festival
                      </Label>
                      <Input
                        id={`festival-name-${festival.id}`}
                        placeholder="Write the name without a number version"
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={`festival-email-${festival.id}`}>
                        Email address
                      </Label>
                      <Input
                        id={`festival-email-${festival.id}`}
                        type="email"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={`festival-certification-${festival.id}`}>
                        Upload certification of membership
                      </Label>
                      <Input
                        id={`festival-certification-${festival.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx"
                      />
                      <p className="text-sm text-muted-foreground">
                        Link to a PDF or word document
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id={`festival-show-${festival.id}`} />
                        <Label htmlFor={`festival-show-${festival.id}`}>
                          Show in the NS profile as a link
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id={`festival-turn-${festival.id}`} />
                        <Label htmlFor={`festival-turn-${festival.id}`}>
                          Turn off profile
                        </Label>
                      </div>
                    </div>
                    {festivals.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFestival(festival.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Festival
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addFestival} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Festival
                </Button>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h2 className="text-lg font-semibold">Groups</h2>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={`group-name-${group.id}`}>
                        Name of the group
                      </Label>
                      <Input
                        id={`group-name-${group.id}`}
                        placeholder="Enter group name"
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={`group-email-${group.id}`}>
                        Email address
                      </Label>
                      <Input
                        id={`group-email-${group.id}`}
                        type="email"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={`group-certification-${group.id}`}>
                        Upload certification of membership
                      </Label>
                      <Input
                        id={`group-certification-${group.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx"
                      />
                      <p className="text-sm text-muted-foreground">
                        Link to a PDF or word document
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id={`group-show-${group.id}`} />
                        <Label htmlFor={`group-show-${group.id}`}>
                          Show in the NS profile as a link
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id={`group-turn-${group.id}`} />
                        <Label htmlFor={`group-turn-${group.id}`}>
                          Turn off profile
                        </Label>
                      </div>
                    </div>
                    {groups.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeGroup(group.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Group
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addGroup} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Group
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
