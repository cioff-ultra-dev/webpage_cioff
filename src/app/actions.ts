"use server";

import {
  festivals,
  groups,
  InsertFestival,
  insertFestivalSchema,
  InsertGroup,
  InsertNationalSectionPositions,
  nationalSectionPositionsLang,
  nationalSections,
  nationalSectionsLang,
  nationalSectionsPositions,
  rolesTable,
  storages,
  users,
} from "@/db/schema";
import { transport } from "@/lib/mailer";
import { put } from "@vercel/blob";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { newFestival } from "@/db/queries/events";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";

const preparedLanguagesByCode = db.query.languages
  .findFirst({
    where: (languages, { eq }) => eq(languages.code, sql.placeholder("locale")),
  })
  .prepare("query_language_by_code");

export async function uploadFile(
  file: File,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  if (!file || file?.size === 0) {
    return undefined;
  }

  const blob = await put(`logos/${file.name}`, file, { access: "public" });

  const [result] = await tx
    .insert(storages)
    .values({ url: blob.url, name: blob.pathname })
    .returning({
      id: storages.id,
    });

  return result.id;
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  formData.set("redirectTo", "/dashboard/festivals");
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

  revalidatePath("/dashboard/festivals");
  redirect("/dashboard/festivals");
}

export async function createGroup(prevState: unknown, formData: FormData) {
  const id = Number(formData.get("_id"));
  const generalDirectorName = formData.get("generalDirectorName") as string;
  const generalDirectorProfile = formData.get(
    "generalDirectorProfile",
  ) as string;
  const artisticDirectorName = formData.get("artisticDirectorName") as string;
  const artisticDirectorProfile = formData.get(
    "artisticDirectorProfile",
  ) as string;
  const directorPhoto = formData.get("directorPhoto") as File;

  await db.transaction(async (tx) => {
    const directorPhotoStorageId = await uploadFile(directorPhoto, tx);

    await tx
      .update(groups)
      .set({
        generalDirectorName,
        generalDirectorProfile,
        directorPhotoStorageId,
        artisticDirectorName,
        artisticDirectorProfile,
      })
      .where(eq(groups.id, id));
  });

  revalidatePath("/dashboard/groups");
  redirect("/dashboard/groups");
}

export async function updateNationalSection(formData: FormData) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations();

  const id = Number(formData.get("id"));
  const name = formData.get("_lang.name") as string;
  const about = formData.get("_lang.about") as string;
  const aboutYoung = formData.get("_lang.aboutYoung") as string;

  const lang = await preparedLanguagesByCode.execute({ locale });

  if (!lang) {
    return { error: "Unrecognized locale" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(nationalSectionsLang)
      .set({ name, about, aboutYoung })
      .where(
        and(
          eq(nationalSectionsLang.nsId, id),
          eq(nationalSectionsLang.lang, lang.id),
        ),
      );
  });

  return { success: "Saved Successfully" };
}

export async function createNationalSection(formData: FormData) {
  const session = await auth();
  const name = formData.get("_lang.name") as string;
  const about = formData.get("_lang.about") as string;
  const aboutYoung = formData.get("_lang.aboutYoung") as string;

  const positionSize = Number(formData.get("_positionSize"));
  const festivalSize = Number(formData.get("_festivalSize"));
  const groupSize = Number(formData.get("_groupSize"));

  const festivalsItems: InsertFestival[] = [];
  const groupsItems: InsertGroup[] = [];

  await db.transaction(async (tx) => {
    const [{ nationalSectionId }] = await tx
      .insert(nationalSections)
      .values({
        // ownerId: session?.user?.id,
        countryId: session?.user?.countryId,
      })
      .returning({
        nationalSectionId: nationalSections.id,
      });

    await tx
      .insert(nationalSectionsLang)
      .values({ name, about, aboutYoung, lang: 1, nsId: nationalSectionId });

    for (let index = 0; index < positionSize; index++) {
      const name = formData.get(`_positions.${index}.name`) as string;
      const email = formData.get(`_positions.${index}.email`) as string;
      const phone = formData.get(`_positions.${index}.phone`) as string;
      const shortBio = formData.get(
        `_positions.${index}._lang.shortBio`,
      ) as string;
      const photo = formData.get(`_festivals.${index}._photo`) as File;

      const storagePhotoId = await uploadFile(photo, tx);

      const [{ nsPositionsId }] = await tx
        .insert(nationalSectionsPositions)
        .values({
          name,
          email,
          phone,
          photoId: storagePhotoId,
          nsId: nationalSectionId,
        })
        .returning({ nsPositionsId: nationalSectionsPositions.id });

      await tx
        .insert(nationalSectionPositionsLang)
        .values({ nsPositionsId, shortBio });
    }

    for (let index = 0; index < festivalSize; index++) {
      const name = formData.get(`_festivals.${index}.name`) as string;
      const email = formData.get(`_festivals.${index}.email`) as string;
      const certificationFile = formData.get(
        `_festivals.${index}.certificationFile`,
      ) as File;

      const storageCertificationFileId = await uploadFile(
        certificationFile,
        tx,
      );

      const role = await tx.query.rolesTable.findFirst({
        where: eq(rolesTable.name, "Festivals"),
      });

      const [user] = await tx
        .insert(users)
        .values({
          email,
          roleId: role?.id || null,
          countryId: session?.user?.countryId,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: { email },
        })
        .returning();

      if (email) {
        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [email],
          subject: `Request Verification your festival called ${name}`,
          text: "You need to verify your account on the platform the ",
        });
      }

      festivalsItems.push({
        name,
        certificationMemberId: storageCertificationFileId,
        ownerId: user.id,
      });
    }

    for (let index = 0; index < groupSize; index++) {
      const name = formData.get(`_groups.${index}.name`) as string;
      const email = formData.get(`_groups.${index}.email`) as string;
      const certificationFile = formData.get(
        `_groups.${index}.certificationFile`,
      ) as File;

      const storageCertificationFileId = await uploadFile(
        certificationFile,
        tx,
      );

      const role = await tx.query.rolesTable.findFirst({
        where: eq(rolesTable.name, "Groups"),
      });

      const [user] = await tx
        .insert(users)
        .values({
          email,
          roleId: role?.id || null,
          countryId: session?.user?.countryId,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: { email },
        })
        .returning();

      if (email) {
        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [email],
          subject: `Request Verification your festival called ${name}`,
          text: "You need to verify your account on the platform",
        });
      }

      groupsItems.push({
        name,
        certificationMemberId: storageCertificationFileId,
        ownerId: user.id,
        countryId: session?.user?.countryId,
      });
    }

    await tx.insert(festivals).values(festivalsItems);
    await tx.insert(groups).values(groupsItems);

    return nationalSectionId;
  });

  revalidatePath("/dashboard/national-sections");
  redirect("/dashboard/national-sections");
}
