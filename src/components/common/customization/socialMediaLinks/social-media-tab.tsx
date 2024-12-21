import { useCallback, BaseSyntheticEvent } from "react";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createSocialMediaLink } from "@/lib/social-media-links";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  SocialMedialLinks,
  SocialMedialLink,
} from "@/db/queries/social-media-links";

import SocialMediaFormModal from "./social-media-form";
import SocialMediaLinksTable from "./social-media-table";

function SocialMediaTab({ socialLinks }: { socialLinks?: SocialMedialLinks }) {
  const router = useRouter();
  const translations = useTranslations("customization");

  const handleSubmit = useCallback(
    async (
      obj: Pick<
        SocialMedialLink,
        "facebookLink" | "instagramLink" | "websiteLink"
      >
    ) => {
      try {
        await createSocialMediaLink(obj);

        toast.success(translations("social.success"));
        router.refresh();
      } catch (error) {
        toast.error(translations("social.error"));
      }
    },
    [router, translations]
  );

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
          <SocialMediaFormModal handleClick={handleSubmit}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {translations("social.addItem")}
                </span>
              </Button>
            </DialogTrigger>
          </SocialMediaFormModal>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <SocialMediaLinksTable socialLinks={socialLinks ?? []} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default SocialMediaTab;
