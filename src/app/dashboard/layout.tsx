import { auth } from "@/auth";
import Dashboard from "@/components/common/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const _ = await auth();

  return <Dashboard>{children}</Dashboard>;
}
