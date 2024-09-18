"use server";

import { insertFestivalSchema } from "@/db/schema";
import { put } from "@vercel/blob";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { newFestival } from "@/db/queries/events";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
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

export async function createFestival(prevState: unknown, formData: FormData) {
  const schema = insertFestivalSchema;
  const logo = formData.get("logo") as File;
  const photos = formData.getAll("photos") as Array<File>;
  const cover = formData.get("coverPhoto") as File;

  let logoUrl = null;
  let coverUrl = null;
  let photosUrl = [];

  if (logo.size) {
    logoUrl = (await put(`logos/${logo.name}`, logo, { access: "public" })).url;
  }

  if (cover.size) {
    coverUrl = (await put(`logos/${cover.name}`, cover, { access: "public" }))
      .url;
  }

  if (photos.length) {
    for await (const item of photos) {
      if (item.size) {
        const result = (
          await put(`logos/${item.name}`, item, { access: "public" })
        ).url;
        photosUrl.push(result);
      }
    }
  }

  const parse = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    stateMode: formData.get("stateMode"),
    directorName: formData.get("directorName"),
    phone: formData.get("phone"),
    address: formData.get("mailAddress"),
    location: formData.get("location"),
    currentDates: formData.get("currentDates"),
    nextDates: formData.get("nextDates"),
    photos: photosUrl.join(","),
    cover: coverUrl,
    logo: logoUrl,
    youtubeId: formData.get("youtubeId"),
  });

  if (!parse.success) {
    return { errors: parse.error.flatten().fieldErrors };
  }

  await newFestival(parse.data!);

  redirect("/dashboard/events");
}
