"use client";

import { useSubscription } from "@/components/provider/subscription";
import { Button } from "@/components/ui/button";
import constants from "@/constants";
import {
  createCheckoutSession,
  createPortalBillingSession,
} from "@/lib/payments";
import { VariantProps } from "class-variance-authority";
import { Nfc, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";

interface ButtonActionProps extends VariantProps<typeof Button> {
  label?: string;
  isLoading?: boolean;
  redirectPath?: string;
  email?: string;
  userId?: string;
  isNationalSections: boolean;
}

export default function ButtonAction({
  isNationalSections,
  label = "Subscribe",
  variant = "default",
  isLoading = false,
  redirectPath,
  userId,
  email,
}: ButtonActionProps) {
  const t = useTranslations("link");
  const { subscription } = useSubscription();

  const isSubscribed = subscription && subscription.status === "active";
  const customerId = subscription?.customerId;

  return (
    <>
      {isNationalSections ? (
        !isSubscribed ? (
          <form action={createCheckoutSession}>
            <input
              type="hidden"
              name="lookup_key"
              value={constants.stripe.lookupKey}
            />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="user_id" value={userId} />
            <input type="hidden" name="redirect_path" value={redirectPath} />
            <Button
              type="submit"
              aria-disabled={isLoading}
              disabled={isLoading}
              className="space-y-0 w-full"
              variant={variant}
              size="default"
            >
              <Nfc className="h-4 w-4 mr-1" />
              {label}
            </Button>
          </form>
        ) : (
          <form action={createPortalBillingSession}>
            <input type="hidden" name="customer_id" value={customerId} />
            <input type="hidden" name="redirect_path" value={redirectPath} />
            <Button
              type="submit"
              aria-disabled={isLoading}
              disabled={isLoading}
              className="space-y-0 w-full"
              variant="secondary"
              size="default"
            >
              <WalletCards className="h-4 w-4 mr-1" />
              {t("billingPortal")}
            </Button>
          </form>
        )
      ) : null}
    </>
  );
}
