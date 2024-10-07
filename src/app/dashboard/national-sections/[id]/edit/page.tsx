import { auth } from "@/auth";
import NationalSectionForm from "@/components/common/ns/form";
import {
  getAllTypePositionsforNS,
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
  const session = await auth();
  const ns: NationalSectionDetailsType | undefined =
    await getNationalSectionBySlug(params.id, locale);
  const currentLang = ns?.langs.find((lang) => lang.l?.code === locale);
  const typePositions = await getAllTypePositionsforNS(locale);

  return (
    <NationalSectionForm
      currentLang={currentLang}
      currentNationalSection={ns}
      id={`${ns?.id}`}
      slug={params.id}
      typePositions={typePositions}
      session={session!}
    />
  );
}
