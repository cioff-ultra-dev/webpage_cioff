import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateSocialMediaLink } from "@/lib/social-media-links";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialMedialLink } from "@/db/queries/social-media-links";

export const formMediaLinkSchema = z.object({
  facebookLink: z.string().url(),
  instagramLink: z.string().url(),
  websiteLink: z.string().url(),
  xLink: z.string().url(),
  youtubeLink: z.string().url(),
  tiktokLink: z.string().url(),
});

function SocialMediaTab({ socialLink }: { socialLink?: SocialMedialLink }) {
  const router = useRouter();
  const translations = useTranslations("customization");

  const form = useForm<z.infer<typeof formMediaLinkSchema>>({
    resolver: zodResolver(formMediaLinkSchema),
    defaultValues: {
      facebookLink: socialLink?.facebookLink ?? "",
      instagramLink: socialLink?.instagramLink ?? "",
      websiteLink: socialLink?.websiteLink ?? "",
      tiktokLink: socialLink?.tiktokLink ?? "",
      youtubeLink: socialLink?.youtubeLink ?? "",
      xLink: socialLink?.xLink ?? "",
    },
  });

  const handleUpdate = useCallback(
    async (
      obj: Pick<
        SocialMedialLink,
        | "facebookLink"
        | "instagramLink"
        | "websiteLink"
        | "tiktokLink"
        | "youtubeLink"
        | "xLink"
      >
    ) => {
      try {
        if (!socialLink) throw new Error("Category not found");

        await updateSocialMediaLink(socialLink.id, obj);

        toast.success(translations("social.updated"));
        router.refresh();
      } catch (e) {
        toast.error(translations("social.notUpdated"));
      }
    },
    [router, translations, socialLink]
  );

  // const handleSubmit = useCallback(
  //   async (
  //     obj: Pick<
  //       SocialMedialLink,
  //       "facebookLink" | "instagramLink" | "websiteLink"
  //     >
  //   ) => {
  //     try {
  //       await createSocialMediaLink(obj);

  //       toast.success(translations("social.success"));
  //       router.refresh();
  //     } catch (error) {
  //       toast.error(translations("social.error"));
  //     }
  //   },
  //   [router, translations]
  // );

  return (
    <TabsContent value="social-networks">
      <Card>
        <CardHeader className="w-full flex justify-between flex-row">
          <div>
            <CardTitle>{translations("tabs.network")}</CardTitle>
            <CardDescription>
              {translations("social.description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <Form {...form}>
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="facebookLink"
                render={({ field }) => (
                  <FormItem className="">
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
                  <FormItem className="">
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
                  <FormItem className="">
                    <FormLabel>{translations("social.form.website")}</FormLabel>
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
              <FormField
                control={form.control}
                name="tiktokLink"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{translations("social.form.tiktok")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {translations("social.form.tiktokDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="youtubeLink"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{translations("social.form.youtube")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {translations("social.form.youtubeDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="xLink"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{translations("social.form.x")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {translations("social.form.xDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
        <CardFooter className="w-full flex justify-end">
          <Button onClick={form.handleSubmit(handleUpdate)}>
            {translations("save")}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

export default SocialMediaTab;
