import { getLocale } from "next-intl/server";
import dynamic from "next/dynamic";

const StepperForm = dynamic(
  () => import("@/components/common/send-emails/stepper-form"),
  {
    ssr: false,
  }
);
import { getAllCategories } from "@/db/queries/categories";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { getAllNestedFestivals } from "@/db/queries/events";
import { Locale } from "@/i18n/config";

export default async function SendEmailsPage() {
  const locale = await getLocale();
  const festivals = await getAllNestedFestivals();
  const countryCast = await getAllCountryCastFestivals(locale as Locale);
  const categories = await getAllCategories(locale as Locale);

  return (
    <div className="w-full p-4 md:p-6">
      <StepperForm
        locale={locale as Locale}
        festivals={festivals}
        countries={countryCast}
        categories={categories}
      />
    </div>
  );
}
