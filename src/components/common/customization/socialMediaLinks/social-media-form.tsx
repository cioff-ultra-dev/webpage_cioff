"use client";

import { ReactNode, useEffect } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogPortal,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { SocialMedialLink } from "@/db/queries/social-media-links";

export const formMediaLinkSchema = z.object({
  facebookLink: z.string().url(),
  instagramLink: z.string().url(),
  websiteLink: z.string().url(),
});

interface ConfirmDialogProps {
  children?: ReactNode;
  handleClick: (
    obj: Pick<
      SocialMedialLink,
      "facebookLink" | "instagramLink" | "websiteLink"
    >
  ) => void;
  initialValue?: SocialMedialLink;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CategoryDialog({
  children,
  handleClick,
  initialValue,
  isOpen,
  onClose,
}: ConfirmDialogProps) {
  const translations = useTranslations("customization");

  const form = useForm<z.infer<typeof formMediaLinkSchema>>({
    resolver: zodResolver(formMediaLinkSchema),
    defaultValues: {
      facebookLink: initialValue?.facebookLink ?? "",
      instagramLink: initialValue?.instagramLink ?? "",
      websiteLink: initialValue?.websiteLink ?? "",
    },
  });

  useEffect(() => {
    if (initialValue) {
      form.setValue("facebookLink", initialValue?.facebookLink ?? "");
      form.setValue("instagramLink", initialValue?.instagramLink ?? "");
      form.setValue("websiteLink", initialValue?.websiteLink ?? "");
    }
  }, [form, initialValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {children}
      <DialogPortal>
        <DialogContent>
          <DialogTitle>{translations("social.form.title")}</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="facebookLink"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        {translations("social.form.facebook")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        {translations("social.form.facebookDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagramLink"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        {translations("social.form.instagram")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        {translations("social.form.instagramDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteLink"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        {translations("social.form.website")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        {translations("social.form.websiteDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </DialogDescription>
          <DialogFooter>
            <DialogClose
              asChild
              onClick={async () => {
                await form.handleSubmit(handleClick)();
                form.reset();
              }}
            >
              <Button>{translations("save")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
