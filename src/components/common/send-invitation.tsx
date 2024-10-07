"use client";

import { sendInvitationLegacy } from "@/app/actions";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const dataSchema = z.object({
  email: z.string().optional(),
  festivalId: z.string().optional(),
});

export default function SendInvitation({
  email,
  festivalId,
  roleName,
  countryId,
}: {
  email: string;
  roleName: string;
  festivalId: number;
  countryId: number;
}) {
  const form = useForm<z.infer<typeof dataSchema>>({
    resolver: zodResolver(dataSchema),
    defaultValues: {
      email: email,
      festivalId: String(festivalId),
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitcForm: SubmitHandler<z.infer<typeof dataSchema>> = async (
    _data
  ) => {
    const result = await (
      await fetch(
        `/api/send-invitation?email=${email}&festivalId=${festivalId}&roleName=${roleName}&countryId=${countryId}`
      )
    ).json();

    if (result.error) {
      toast.error(result.error);
    }

    if (result.success) {
      toast.success(result.success);
    }
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmitcForm)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormControl>
              <Input
                name={field.name}
                ref={field.ref}
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                type="hidden"
              />
            </FormControl>
          )}
        />
        <FormField
          control={form.control}
          name="festivalId"
          render={({ field }) => (
            <FormControl>
              <Input
                name={field.name}
                ref={field.ref}
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                type="hidden"
              />
            </FormControl>
          )}
        />
        <button type="submit">Send Invitation</button>
      </form>
    </Form>
  );
}
