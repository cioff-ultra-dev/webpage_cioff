"use server";

import { InsertEvent, insertEventSchema } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { newEvent } from "@/db/queries/events";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  formData.set("redirectTo", "/dashboard/events");
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid Credentials";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function createEvent(prevState: unknown, formData: FormData) {
  const schema = insertEventSchema;

  const categories = formData.getAll("categories") || [];
  const isApproved = formData.get("approved") === "on";
  const logo = formData.get("logo") as File;
  let logoUrl = null;

  if (logo.size) {
    logoUrl = await put(`logos/${logo.name}`, logo, { access: "public" });
  }

  const parse = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    stateMode: formData.get("state_mode"),
  });

  if (!parse.success) {
    return { errors: parse.error.flatten().fieldErrors };
  }

  await newEvent(parse.data!);

  redirect("/dashboard/events");
}
