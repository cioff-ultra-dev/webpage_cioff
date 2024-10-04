import { SessionProvider } from "next-auth/react";
import Dashboard from "@/components/common/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Dashboard>{children}</Dashboard>
    </SessionProvider>
  );
}
