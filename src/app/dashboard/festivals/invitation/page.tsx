import { auth } from "@/auth";
import GenerateInvitaitonFestivalForm from "@/components/common/event/genrate-invitation-form";
import { getCurrentNationalSection } from "@/db/queries/national-sections";
import { redirect } from "next/navigation";

export default async function GenerateFestivalPage() {
  const session = await auth();

  if (!session) {
    redirect("/dashboard");
  }

  const currentNationalSection = await getCurrentNationalSection(
    session.user.countryId,
  );

  return (
    <GenerateInvitaitonFestivalForm
      currentNationalSection={currentNationalSection}
    />
  );
}
