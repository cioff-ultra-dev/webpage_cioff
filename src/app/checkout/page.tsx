import { auth, update } from "@/auth";
import CheckoutCanceled from "@/components/common/payments/checkout-cancel";
import CheckoutSuccess from "@/components/common/payments/checkout-success";
import { getUserAuth } from "@/db/queries";
import { getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export default async function CheckoutPage({
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string };
}) {
  const format = await getFormatter();
  const session = await auth();

  if (searchParams.canceled) {
    return (
      <CheckoutCanceled
        redirectTo={searchParams.redirect_path || "/dashboard"}
      />
    );
  }

  if (!searchParams.session_id) {
    return redirect(searchParams.redirect_path || "/dashboard");
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(
    searchParams.session_id,
    {
      expand: ["subscription", "subscription.plan.product"],
    }
  );

  const subscription = checkoutSession.subscription as Stripe.Subscription & {
    plan: Stripe.Plan;
  };

  const product = subscription.plan.product as Stripe.Product;

  return (
    <CheckoutSuccess
      sessionId={searchParams.session_id}
      redirectTo={searchParams.redirect_path}
    >
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Product name</span>
          <span className="font-medium">{product.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Date</span>
          <span className="font-medium">
            {format.dateTime(new Date(subscription.created * 1000), {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total amount</span>
          <span className="font-medium">
            {format.number(subscription.plan.amount! / 100, {
              style: "currency",
              currency: "USD",
            })}
          </span>
        </div>
      </div>
    </CheckoutSuccess>
  );
}
