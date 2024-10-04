import { auth } from "@/auth";
import GenerateInvitationFestivalForm from "@/components/common/event/generate-invitation-form";
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
    <GenerateInvitationFestivalForm
      currentNationalSection={currentNationalSection}
    />
  );
}
