import { auth } from "@/auth";
import NationalSectionForm from "@/components/common/ns/form";

export default async function NewNS() {
  const session = await auth();
  return <NationalSectionForm session={session!} />;
}
