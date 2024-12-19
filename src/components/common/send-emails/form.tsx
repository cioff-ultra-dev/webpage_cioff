"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRef, useState } from "react";
import { toast } from "sonner";

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
  emails: string[];
};

export function SendEmailsForm({ emails }: SendEmailsFormProps) {
  const form = useForm<EmailFormType>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: EmailFormType) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("to", JSON.stringify(emails));
    formData.append("subject", data.subject);
    formData.append("content", data.content);

    if (data.attachments) {
      for (const file of data.attachments) {
        formData.append("attachments", file);
      }
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      toast.success("Emails sent successfully");
    } else {
      toast.error("Failed to send emails");
    }

    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Subject
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Enter the email subject.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Content
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>Write the email content.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormDescription>
                You can upload multiple files as attachments.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Submit label="Send Email" isLoading={isSubmitting} />
        </div>
      </form>
    </Form>
  );
}
