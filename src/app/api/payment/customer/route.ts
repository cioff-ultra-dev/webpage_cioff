import Stripe from "stripe";
import { db } from "@/db";
import { roles, SelectUser, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export async function POST(request: Request) {
  const { email = "" } = await request.json();

  if (!email) {
    return Response.json(null, { status: 404 });
  }

  const sq = db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "National Sections"))
    .limit(1);

  let currentUser: SelectUser | undefined = await db.query.users.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.email, email), eq(fields.roleId, sq));
    },
  });

  if (currentUser && !currentUser.stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: `${currentUser.firstname}${
        currentUser.lastname ? ` ${currentUser.lastname}` : ""
      }`,
      email: currentUser.email,
    });

    if (customer.id) {
      [currentUser] = await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, currentUser.id))
        .returning();
    }
  }

  return Response.json({ test: "hello" });
}
