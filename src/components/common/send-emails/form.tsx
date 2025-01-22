"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

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
import { Textarea } from "@/components/ui/textarea";
import { Button, ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Submit({
  label = "Send Email",
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

const emailFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  attachments: z.any().optional(),
});

type EmailFormType = z.infer<typeof emailFormSchema>;

type SendEmailsFormProps = {
  handleNextStep: (step: number) => void;
  handleSubmit: (data: EmailFormType) => Promise<void>;
};

export function SendEmailsForm({
  handleNextStep,
  handleSubmit,
}: SendEmailsFormProps) {
  const translations = useTranslations("sendEmails");
  const form = useForm<EmailFormType>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: EmailFormType) => {
    setIsSubmitting(true);

    await handleSubmit(data);

    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <h1 className="text-2xl font-bold">{translations("emailTitle")}</h1>
            <p className="text-sm text-muted-foreground pb-10">
              {translations("emailDescription")}
            </p>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                    {translations("subject")}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {translations("subjectDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                    {translations("content")}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    {translations("contentDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>{translations("attachments")}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    {translations("attachmentsDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button type="button" onClick={() => handleNextStep(0)}>
            {translations("previous")}
          </Button>
          <Submit label={translations("send")} isLoading={isSubmitting} />
        </div>
      </form>
    </Form>
  );
}
