import React from "react";
import { Subscription, SubscriptionProvider } from "../provider/subscription";
import { auth } from "@/auth";
import { getUserAuthById } from "@/db/queries";
import { notFound } from "next/navigation";

const SubscriptionWrapper: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const session = await auth();

  if (!session?.user) {
    return notFound();
  }

  const currentUser = await getUserAuthById(session?.user.id!);

  const currentSubscription = currentUser?.subscription;

  const valueSubscription: Subscription | null = currentSubscription
    ? ({
        id: currentSubscription.stripeSubscriptionId,
        customerId: currentSubscription.stripeCustomerId,
        status: currentSubscription.status,
      } as Subscription)
    : null;

  return (
    <SubscriptionProvider value={valueSubscription}>
      {children}
    </SubscriptionProvider>
  );
};

export default SubscriptionWrapper;
