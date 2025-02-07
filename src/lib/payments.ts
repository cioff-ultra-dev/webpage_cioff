"use server";

import { db } from "@/db";
import { roles, SelectUser, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

const YOUR_DOMAIN = process.env.HOSTNAME_URL;

export async function createCheckoutSession(formData: FormData) {
  const prices = await stripe.prices.list({
    lookup_keys: [formData.get("lookup_key") as string],
    expand: ["data.product"],
  });

  const userId = formData.get("user_id") as string;

  const sq = db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "National Sections"))
    .limit(1);

  let currentUser: SelectUser | undefined = await db.query.users.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.id, userId), eq(fields.roleId, sq));
    },
    with: {
      subscription: true,
    },
  });

  if (currentUser && !currentUser.stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: `${currentUser.firstname}${
        currentUser.lastname ? ` ${currentUser.lastname}` : ""
      }`,
      email: currentUser.email,
      metadata: {
        userId: currentUser.id,
      },
    });

    if (customer.id) {
      [currentUser] = await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, currentUser.id))
        .returning();
    }
  }

  if (currentUser && currentUser.stripeCustomerId) {
    await stripe.customers.update(currentUser.stripeCustomerId, {
      name: `${currentUser.firstname}${
        currentUser.lastname ? ` ${currentUser.lastname}` : ""
      }`,
      email: currentUser.email,
      metadata: {
        userId: currentUser.id,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    line_items: [
      {
        price: prices.data[0].id,
        quantity: 1,
      },
    ],
    customer: currentUser?.stripeCustomerId as string,
    mode: "subscription",
    success_url: `${YOUR_DOMAIN}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}&redirect_path=${formData.get(
      "redirect_path"
    )}`,
    cancel_url: `${YOUR_DOMAIN}/checkout?canceled=true&redirect_path=${formData.get(
      "redirect_path"
    )}`,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createPortalSession(
  sessionId: string,
  redirectTo: string
) {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer as string,
    return_url: `${YOUR_DOMAIN}${redirectTo}`,
  });

  if (portalSession.url) {
    redirect(portalSession.url);
  }
}

export async function createPortalBillingSession(formData: FormData) {
  const customerId = formData.get("customer_id") as string;
  const redirectTo = formData.get("redirect_path") as string;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${YOUR_DOMAIN}${redirectTo}`,
  });

  if (portalSession.url) {
    redirect(portalSession.url);
  }
}
