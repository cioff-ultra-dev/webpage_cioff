import { auth } from "@/auth";
import GenerateInvitationGroupForm from "@/components/common/group/generate-invitation-form";
import { getCurrentNationalSection } from "@/db/queries/national-sections";
import { redirect } from "next/navigation";

export default async function GenerateGroupPage() {
  const session = await auth();

  if (!session) {
    redirect("/dashboard");
  }

  const currentNationalSection = await getCurrentNationalSection(
    session.user.countryId,
  );

  return (
    <GenerateInvitationGroupForm
      currentNationalSection={currentNationalSection}
    />
  );
}
