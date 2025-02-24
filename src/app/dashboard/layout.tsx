import { SessionProvider } from "next-auth/react";
import Dashboard from "@/components/common/dashboard";
import SubscriptionWrapper from "@/components/extension/subscription-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SubscriptionWrapper>
        <Dashboard>{children}</Dashboard>
      </SubscriptionWrapper>
    </SessionProvider>
  );
}
