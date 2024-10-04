"use client";

import { generateFestival } from "@/app/actions";
import { Button, ButtonProps } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef } from "react";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { customRevalidatePath } from "../revalidateTag";
import { useRouter } from "next/navigation";
import { CurrentNationalSectionType } from "@/db/queries/national-sections";

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

const invitationFormSchema = z.object({
  _nsId: z.number().optional(),
  name: z.string(),
  email: z.string().email(),
});

export default function GenerateInvitationFestivalForm({
  currentNationalSection,
}: {
  currentNationalSection: CurrentNationalSectionType;
}) {
  const form = useForm<z.infer<typeof invitationFormSchema>>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      _nsId: currentNationalSection?.id ?? 0,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const onSubmitForm: SubmitHandler<
    z.infer<typeof invitationFormSchema>
  > = async (_) => {
    const result = await generateFestival(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    // customRevalidatePath("/dashboard/festivals");
    //
    // if (result.success) {
    //   router.push("/dashboard/festivals");
    // }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold">GENERATE FESTIVAL INVITATION</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
      </p>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmitForm)}>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>New Festival</CardTitle>
            </CardHeader>
            <FormField
              control={form.control}
              name="_nsId"
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
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
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
                          value={field.value}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter name of the festival
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
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
                          value={field.value}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter email address related to the festival
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="sticky bottom-5 mt-4 right-0 flex justify-end">
            <Card className="flex justify-end gap-4 w-full">
              <CardContent className="flex-row items-center p-4 flex w-full justify-end">
                <div className="flex gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard/festivals">Cancel</Link>
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
