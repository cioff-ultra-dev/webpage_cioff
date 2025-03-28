import { useState, useCallback, useRef, useMemo } from "react";
import { DraggableProvided } from "@hello-pangea/dnd";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuItem, SelectedMenuLang } from "@/types/customization";
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@/components/ui/dialog";
import ConfirmDialog from "../../confirmDialog";

interface CollapsibleProps extends DraggableProvided {
  initialContent?: SelectedMenuLang;
  handleSave: (item: SelectedMenuLang) => void;
  handleRemove: (menuId: number, body: MenuItem) => void;
}

export const formMenuSchema = z.object({
  slug: z.string().url().min(4),
  name: z.string().min(4),
  order: z.number(),
});

function MenuItemComponent({
  initialContent,
  handleSave,
  handleRemove,
  ...props
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const translations = useTranslations("customization");

  const initialValues = useMemo(
    () => ({
      name: initialContent?.name ?? "",
      slug: initialContent?.menu?.slug ?? "",
    }),
    [initialContent]
  );

  const form = useForm<z.infer<typeof formMenuSchema>>({
    resolver: zodResolver(formMenuSchema),
    defaultValues: {
      name: initialValues.name ?? "",
      order: 0,
      slug: initialValues.slug ?? "",
    },
  });

  const formState = form.watch();

  const handleClick = useCallback(() => {
    if (!isOpen) {
      ref.current?.classList.remove("h-0");
      ref.current?.classList.add("h-auto");
    } else {
      ref.current?.classList.add("h-0");
      ref.current?.classList.remove("h-auto");
    }

    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formMenuSchema>) => {
      const item: SelectedMenuLang = {
        name: values.name,
        menu: {
          order: values.order,
          slug: values.slug,
        },
      };

      if (initialContent?.id) {
        item.id = initialContent.id;
        item.menu.id = initialContent.menu.id;
      }

      await handleSave(item);

      handleClick();
    },
    [handleClick, handleSave, initialContent]
  );

  return (
    <div
      ref={props.innerRef}
      {...props.draggableProps}
      {...props.dragHandleProps}
      className={cn(
        "flex-none p-4 border rounded shadow-sm transition-all duration-300 ease-in-out",
        isOpen ? "h-auto" : "h-12"
      )}
    >
      <div className="relative w-full">
        <div className="h-4 flex items-center justify-between">
          <span>{formState.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-gray-700 text-xl"
            onClick={handleClick}
          >
            {isOpen ? "-" : "+"}
          </Button>
        </div>
        <div ref={ref} className="mt-2 overflow-hidden h-0">
          <Form {...form}>
            <div className="grid grid-cols-1 gap-4 mb-4 mx-2 border-t mt-2 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations("menu.form.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} className="focus-visible:ring-0" />
                    </FormControl>
                    <FormDescription>
                      {translations("menu.form.nameDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations("menu.form.route")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {translations("menu.form.routeDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
          <div className="w-full flex justify-between items-end mt-6">
            <ConfirmDialog
              buttonMessage={translations("remove")}
              buttonVariant="destructive"
              message={translations("menu.form.removeConfirm", {
                name: formState.name ?? "title",
              })}
              title={translations("menu.form.remove")}
              handleClick={() =>
                handleRemove(initialContent?.menuId ?? 0, formState)
              }
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  title={translations("remove")}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
            </ConfirmDialog>
            <Button onClick={form.handleSubmit(handleSubmit)}>
              {translations("save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuItemComponent;
