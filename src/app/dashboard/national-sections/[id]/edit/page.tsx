import NationalSectionForm from "@/components/common/ns/form";
import {
  getNationalSectionBySlug,
  NationalSectionDetailsType,
} from "@/db/queries/national-sections";
import { getLocale } from "next-intl/server";

export default async function EditNationalSection({
  params,
}: {
  params: { id: string };
}) {
  const locale = await getLocale();
  const ns: NationalSectionDetailsType | undefined =
    await getNationalSectionBySlug(params.id, locale);
  const currentLang = ns?.langs.find((lang) => lang.l?.code === locale);

  return (
    <NationalSectionForm
      currentLang={currentLang}
      currentNationalSection={ns}
      id={`${ns?.id}`}
    />
  );
}
