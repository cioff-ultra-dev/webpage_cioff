"use client";

import { updateAccountFields, updatePasswordFields } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  Card,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useSession } from "next-auth/react";

const profileFieldSchema = accountFieldsSchema;

const accountPasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
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
      new FormData(accountFormRef.current!),
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
      new FormData(passwordFormRef.current!),
    );
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    if (result.success) {
      passwordForm.reset();

      customRevalidatePath("/dashboard");
      router.push("/dashboard");
    }
  };

  const accountFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Card x-chunk="dashboard-04-chunk-2">
        <CardHeader>
          <CardTitle id="change-password">Change Password</CardTitle>
          <CardDescription>
            This section will provide changing your password account
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
                      <FormLabel>Current Password</FormLabel>
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
                        Include your current password
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
                      <FormLabel>New Password</FormLabel>
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
                        Include your new password
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
                      <FormLabel>Confirm Password</FormLabel>
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
                        Include your confirmation of your new password
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
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>Profile Fields</CardTitle>
          <CardDescription>
            Provide base fields related to your account
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
                      <FormLabel>First name</FormLabel>
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
                        This is your current first name.
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
                      <FormLabel>Last name</FormLabel>
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
                        This is your current last name.
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
                      <FormLabel>Email Address</FormLabel>
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
                        This is your current email.
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
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
