import { getLocale } from "next-intl/server";

import Tabs, {
  TabsComponentProps,
} from "@/components/common/customization/tabs";
import { TabOptions } from "@/types/customization";
import { getMenuByLocale } from "@/lib/menu";
import { Locale } from "@/i18n/config";
import { getAllCategories } from "@/db/queries/categories";
import { getAllSocialMediaLinks } from "@/db/queries/social-media-links";
import { getBannerFromLocale } from "@/db/queries/design";
import { getTimelineFromLocale } from "@/db/queries/timeline";

export interface CustomizationProps {
  searchParams: {
    tab: TabOptions;
  };
}

async function CustomizationPage({
  searchParams: { tab = "banner" },
}: CustomizationProps) {
  const locale = (await getLocale()) as Locale;

  const props: TabsComponentProps = {
    currentTab: tab,
  };

  switch (tab) {
    case "categories":
      const categories = await getAllCategories(locale);
      props.categories = categories;
      break;
    case "menu":
      const menu = await getMenuByLocale(locale);

      props.menu = menu.sort((a, b) => a.menu.order - b.menu.order);
      break;
    case "social-networks":
      const socialLinks = await getAllSocialMediaLinks();

      props.socialLink = socialLinks;
    case "banner":
      const banner = await getBannerFromLocale(locale);

      props.banner = banner;
    case "timeline":
      const timeline = await getTimelineFromLocale(locale);

      props.timeline = timeline;
  }

  return <Tabs {...props} />;
}

export default CustomizationPage;