import { NextRequest } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { and, eq, getTableColumns, SQL, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { stripe, Stripe } from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_ENDPOINT_SECREY! as string;

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"]
>(
  table: T,
  columns: Q[]
) => {
  const cls = getTableColumns(table);
  return columns.reduce((acc, column) => {
    const colName = cls[column].name;
    acc[column] = sql.raw(`excluded.${colName}`);
    return acc;
  }, {} as Record<Q, SQL>);
};

export async function POST(request: NextRequest) {
  let payload = await (await request.blob()).text();
  let event: Stripe.Event = {} as Stripe.Event;

  if (endpointSecret) {
    const signature = request.headers.get("stripe-signature") as string;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );
    } catch (err) {
      const error = err as Error;
      console.log(`Webhook signature verification failed.`, error.message);
      return new Response(null, { status: 400 });
    }
  }
  switch (event.type) {
    case "customer.deleted":
      const customerDeleted = event.data.object as Stripe.Customer;
      const userId = customerDeleted.metadata.userId as string;

      if (userId && customerDeleted.id) {
        await db
          .update(users)
          .set({ stripeCustomerId: null })
          .where(
            and(
              eq(users.id, userId),
              eq(users.stripeCustomerId, customerDeleted.id)
            )
          );
      }

      console.log(
        `Customer account deleted: ${customerDeleted.metadata.userId}`
      );
      break;
    case "customer.subscription.trial_will_end":
      const subscriptionTrialWillEnd = event.data.object as Stripe.Subscription;

      console.log({ subscriptionTrialWillEnd });

      const currentSubscription = await db.query.subscriptions.findFirst({
        where(fields, { eq }) {
          return eq(fields.stripeSubscriptionId, subscriptionTrialWillEnd.id);
        },
      });

      if (currentSubscription) {
        await db
          .update(subscriptions)
          .set({
            status: subscriptionTrialWillEnd.status,
          })
          .where(
            eq(
              subscriptions.stripeSubscriptionId,
              currentSubscription.stripeSubscriptionId
            )
          );
      }

      console.log(
        `Subscription trial will end: ${subscriptionTrialWillEnd.id}`
      );
      break;
    case "customer.subscription.created":
      const subscriptionCreated = event.data.object as Stripe.Subscription;

      console.log(`Subscription created: ${subscriptionCreated.id}`);
      break;
    case "customer.subscription.updated":
      const subscriptionUpdated = event.data.object as Stripe.Subscription;

      const customer = (await stripe.customers.retrieve(
        subscriptionUpdated.customer as string
      )) as Stripe.Customer;

      await db
        .insert(subscriptions)
        .values({
          userId: customer.metadata.userId as string,
          stripeCustomerId: subscriptionUpdated.customer as string,
          stripeSubscriptionId: subscriptionUpdated.id,
          status: subscriptionUpdated.status,
          currentPeriodStart: new Date(
            subscriptionUpdated.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            subscriptionUpdated.current_period_end * 1000
          ),
          cancelAtPeriodEnd: subscriptionUpdated.cancel_at_period_end,
        })
        .onConflictDoUpdate({
          target: [subscriptions.stripeSubscriptionId],
          set: buildConflictUpdateColumns(subscriptions, [
            "status",
            "currentPeriodStart",
            "currentPeriodEnd",
            "cancelAtPeriodEnd",
          ]),
        });

      console.log(`Subscription updated: ${subscriptionUpdated.id}`);
      break;
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object as Stripe.Subscription;

      console.log({ subscriptionDeleted });

      await db
        .delete(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionDeleted.id));

      console.log(`Subscription deleted: ${subscriptionDeleted.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(null, { status: 200 });
}
