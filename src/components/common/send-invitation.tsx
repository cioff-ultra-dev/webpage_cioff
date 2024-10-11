"use client";

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
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { customRevalidatePath } from "./revalidateTag";

const dataSchema = z.object({
  email: z.string().email().optional(),
  festivalId: z.string().optional(),
});

export default function SendInvitation({
  email,
  festivalId,
  roleName,
  countryId,
  userId,
  ownerId,
  groupId,
  nsId,
  open,
  setOpen,
}: {
  email: string;
  roleName: string;
  countryId: number;
  ownerId?: number;
  userId?: string;
  entityId?: number;
  festivalId?: number;
  groupId?: number;
  nsId?: number;
  open?: boolean;
  setOpen?: (value: boolean) => void;
}) {
  const form = useForm<z.infer<typeof dataSchema>>({
    resolver: zodResolver(dataSchema),
    defaultValues: {
      email: email,
      festivalId: String(festivalId),
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitForm: SubmitHandler<z.infer<typeof dataSchema>> = async (
    data,
  ) => {
    const result = await (
      await fetch(
        `/api/send-invitation?email=${data.email}&festivalId=${
          festivalId ?? ""
        }&roleName=${roleName}&countryId=${countryId}&userId=${userId}&groupId=${
          groupId ?? ""
        }&ownerId=${ownerId ?? ""}&nsId=${nsId ?? ""}`,
      )
    ).json();

    if (result.error) {
      form.setFocus("email");
      toast.error(result.error);
    }

    if (result.warning) {
      toast.warning(result.warning);
      form.resetField("email");
      if (setOpen) {
        setOpen(false);
      }
    }

    if (result.success) {
      customRevalidatePath(
        roleName === "Groups" ? "/dashboard/groups" : "/dashboard/festivals",
      );
      toast.success(result.success);
      form.resetField("email");
      if (setOpen) {
        setOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <DialogContent>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmitForm)}>
          <DialogHeader>
            <DialogTitle>Confirm Invitation</DialogTitle>
            <DialogDescription>
              Make changes to your invitation here. Click send when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Email</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the main account to provide email invitation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                disabled={form.formState.isSubmitting}
              >
                Close
              </Button>
            </DialogClose>
            <Button
              size="sm"
              variant="default"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Send
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
