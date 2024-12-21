import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { updateBannerInfo } from "@/db/queries/design";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DesignListType } from "@/db/queries/design";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FilePondErrorDescription,
  FilePondFile,
  FilePondInitialFile,
} from "filepond";
import { FilepondImageUploader } from "@/components/extension/filepond-image-uploader";
import { Locale } from "@/i18n/config";

export const formSectionSchema = z.object({
  title: z.string().min(4),
  subtitle: z.string().min(4),
});

function BannerTab({
  banner,
  locale,
}: {
  banner: DesignListType;
  locale: Locale;
}) {
  const [image, setImage] = useState("");

  const router = useRouter();
  const translations = useTranslations("customization");

  const form = useForm<z.infer<typeof formSectionSchema>>({
    resolver: zodResolver(formSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
    },
  });

  const initialImage = useMemo(() => {
    if (banner) {
      const image = banner.find((item) => item.key === "image");
      const title = banner.find((item) => item.key === "title");
      const subtitle = banner.find((item) => item.key === "subtitle");

      setImage(image?.value ?? "");
      form.setValue("title", title?.value ?? "");
      form.setValue("subtitle", subtitle?.value ?? "");

      const initialImage: FilePondInitialFile[] = image?.value
        ? [
            {
              source: image?.value,
              options: {
                type: "local",
              },
            },
          ]
        : [];

      return initialImage;
    }

    return [];
  }, [banner]);

  const onLoadMainImage = useCallback(
    (error: FilePondErrorDescription | null, file: FilePondFile) => {
      if (error) {
        console.error(error);
        return;
      }

      setImage(file.serverId);
    },
    []
  );

  const handleSubmit = useCallback(
    async (obj: { title: string; subtitle: string }) => {
      try {
        const bannerInfo = {
          title: { key: "title", value: obj.title },
          subtitle: { key: "subtitle", value: obj.subtitle },
          image: { key: "image", value: image },
        };

        await updateBannerInfo(bannerInfo, locale);

        toast.success(translations("banner.updated"));
        router.refresh();
      } catch (error) {
        toast.error(translations("banner.notUpdated"));
      }
    },
    [router, translations, locale, image]
  );

  return (
    <TabsContent value="banner">
      <Card>
        <CardHeader className="w-full flex justify-between flex-row">
          <div>
            <CardTitle>{translations("tabs.banner")}</CardTitle>
            <CardDescription>
              {translations("banner.description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <Form {...form}>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{translations("banner.form.title")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {translations("banner.form.titleDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      {translations("banner.form.subtitle")}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {translations("banner.form.subtitleDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
          <div className="flex flex-col gap-4 my-4">
            <label>{translations("banner.form.image")}</label>
            <FilepondImageUploader
              maxFiles={1}
              defaultFiles={initialImage}
              onprocessfile={onLoadMainImage}
            />
          </div>
          <div className="w-full flex justify-end mt-8">
            <Button onClick={form.handleSubmit(handleSubmit)}>
              {translations("save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default BannerTab;
