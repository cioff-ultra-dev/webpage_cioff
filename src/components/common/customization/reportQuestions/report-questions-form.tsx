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

interface ConfirmDialogProps {
  children?: ReactNode;
  handleClick: (obj: { name: string }) => void;
  initialValue?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const formCategorySchema = z.object({
  name: z.string().min(4),
});

export default function RatingQuestionDialog({
  children,
  handleClick,
  initialValue,
  isOpen,
  onClose,
}: ConfirmDialogProps) {
  const translations = useTranslations("customization");

  const form = useForm<z.infer<typeof formCategorySchema>>({
    resolver: zodResolver(formCategorySchema),
    defaultValues: {
      name: initialValue ?? "",
    },
  });

  useEffect(() => {
    if (initialValue) {
      form.setValue("name", initialValue);
    }
  }, [form, initialValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {children}
      <DialogPortal>
        <DialogContent>
          <DialogTitle>
            {translations("reportQuestions.form.title")}
          </DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        {translations("reportQuestions.form.name")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        {translations("reportQuestions.form.nameDescription")}
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
