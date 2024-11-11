"use client";

import { updateFestivalStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SelectStatus } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { customRevalidatePath } from "../revalidateTag";

const formSchema = z.object({
  _status: z.string(),
});

export default function FormStateNS({
  statuses,
  festivalId,
  currentStatusId,
}: {
  statuses: SelectStatus[];
  festivalId?: string;
  currentStatusId?: string;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _status: currentStatusId ? currentStatusId : undefined,
    },
  });

  const formTest = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _status: currentStatusId ? currentStatusId : undefined,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmitForm: SubmitHandler<z.infer<typeof formSchema>> = async (
    _data,
  ) => {
    const result = await updateFestivalStatus(new FormData(formRef.current!));
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }

    customRevalidatePath("/dashboard/festivals");
  };

  return (
    <>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmitForm)}>
          <input type="hidden" name="festivalId" value={festivalId} />
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                      Recognition Status
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name={field.name}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem
                            key={status.slug}
                            value={String(status.id)}
                          >
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                variant="secondary"
                disabled={form.formState.isSubmitting}
              >
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <Separator className="my-6 bg-gray-200" />
    </>
  );
}
