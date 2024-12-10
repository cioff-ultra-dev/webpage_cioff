// import { EmailFilter } from "@/components/common/emails-filter";
import GlobalFilterPreview from "@/components/common/global-filter-preview";
import { SendEmailsForm } from "@/components/common/send-emails/form";
import { getAllCategories } from "@/db/queries/categories";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { getAllNestedFestivals } from "@/db/queries/events";
import { Locale } from "@/i18n/config";
import { getLocale } from "next-intl/server";

export default async function SendEmailsPage() {
  const locale = await getLocale();

  const festivals = await getAllNestedFestivals();
  const countryCast = await getAllCountryCastFestivals(locale as Locale);
  const categories = await getAllCategories(locale as Locale);
  const emails = ["example1@example.com", "example2@example.com"];

  return (
    <div className="w-full p-4 md:p-6">
      <GlobalFilterPreview
        fallbackFestivals={festivals}
        fallbackCountryCast={countryCast}
        categories={categories}
      />
      {/* <EmailFilter categories={categories} />; */}
      <h1 className="text-2xl font-bold">SEND EMAIL</h1>
      <p className="text-sm text-muted-foreground pb-10">
        The fields with * are mandatory.
      </p>
      <SendEmailsForm emails={emails} />
    </div>
  );
}
