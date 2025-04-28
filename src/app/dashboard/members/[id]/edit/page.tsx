import { auth } from "@/auth";
import NationalSectionForm from "@/components/common/ns/form";
import {
  getAllTypePositionsforNS,
  getNationalSectionBySlug,
  NationalSectionDetailsType,
} from "@/db/queries/national-sections";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

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

  if (
    ns !== undefined &&
    !ns.owners.some((owner) => owner.userId === session?.user.id)
  )
    redirect("/dashboard/members");

  return (
    <NationalSectionForm
      currentLang={currentLang}
      currentNationalSection={ns}
      id={`${ns?.id}`}
      slug={params.id}
      typePositions={typePositions}
      session={session!}
      locale={locale}
    />
  );
}
