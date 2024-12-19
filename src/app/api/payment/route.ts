import Stripe from "stripe";
import { NextRequest } from "next/server";

// const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export async function GET(_request: NextRequest) {
  // const products = await stripe.prices.list({ active: true });
  //
  // const [mainProduct] = products.data;
  //
  // return Response.json({ mainProduct });
}
