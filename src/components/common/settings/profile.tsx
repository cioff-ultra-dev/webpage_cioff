"use client";

import { updateAccountFields, updatePasswordFields } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  Card,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { accountFieldsSchema, SelectUser } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useI18nZodErrors } from "@/hooks/use-i18n-zod-errors";
import { useRouter } from "next/navigation";
import { customRevalidatePath } from "../revalidateTag";
import { useTranslations } from "next-intl";

const profileFieldSchema = accountFieldsSchema;

const accountPasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8)
      .max(16)
      .refine((value) => /[A-Z]/.test(value), {
        params: { i18n: "password_uppercase" },
      })
      .refine((value) => /[a-z]/.test(value), {
        params: { i18n: "password_lowercase" },
      })
      .refine((value) => /\d/.test(value), {
        params: { i18n: "password_number" },
      })
      .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
        params: { i18n: "password_special" },
      }),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    params: { i18n: "password_match" },
  });

export default function SettingProfile({
  session,
  currentInfo,
}: {
  session: Session;
  currentInfo: SelectUser;
}) {
  useI18nZodErrors("profile");
  const translations = useTranslations("form.profile");
  const router = useRouter();

  const accountForm = useForm<z.infer<typeof profileFieldSchema>>({
    resolver: zodResolver(profileFieldSchema),
    defaultValues: {
      firstname: currentInfo?.firstname,
      lastname: currentInfo?.lastname,
      email: currentInfo?.email,
    },
  });

  const passwordForm = useForm<z.infer<typeof accountPasswordSchema>>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: {},
  });

  const onSubmitAccountForm: SubmitHandler<
    z.infer<typeof profileFieldSchema>
  > = async (_data) => {
    const result = await updateAccountFields(
      new FormData(accountFormRef.current!)
    );
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    if (result.success) {
      accountForm.reset();
    }
  };

  const onSubmitPasswordForm: SubmitHandler<
    z.infer<typeof accountPasswordSchema>
  > = async (_data) => {
    const result = await updatePasswordFields(
      new FormData(passwordFormRef.current!)
    );
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    customRevalidatePath("/dashboard");

    if (result.success) {
      passwordForm.reset();

      router.push("/dashboard");
    }
  };

  const accountFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Card x-chunk="dashboard-04-chunk-2">
        <CardHeader>
          <CardTitle id="change-password">
            {translations("changePassword")}
          </CardTitle>
          <CardDescription>
            {translations("changePasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              ref={passwordFormRef}
              onSubmit={passwordForm.handleSubmit(onSubmitPasswordForm)}
              className="space-y-4"
            >
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations("currentPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          name={field.name}
                          ref={field.ref}
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        {translations("currentPasswordDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations("newPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          name={field.name}
                          ref={field.ref}
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        {translations("newPasswordDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations("confirmPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          name={field.name}
                          ref={field.ref}
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        {translations("confirmPasswordDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border-t space-y-4 pt-4">
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {translations("save")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>{translations("profileFields")}</CardTitle>
          <CardDescription>
            {translations("profileFieldsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...accountForm}>
            <form
              ref={accountFormRef}
              onSubmit={accountForm.handleSubmit(onSubmitAccountForm)}
              className="space-y-4"
            >
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={accountForm.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations("name")}</FormLabel>
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
                        {translations("nameDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={accountForm.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations("lastName")}</FormLabel>
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
                        {translations("lastNameDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations("email")}</FormLabel>
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
                        {translations("emailDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border-t space-y-4 pt-4">
                <Button
                  type="submit"
                  disabled={accountForm.formState.isSubmitting}
                >
                  {translations("save")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
