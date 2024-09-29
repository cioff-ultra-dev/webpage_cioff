"use server";

import {
  festivals,
  groups,
  InsertFestival,
  insertFestivalSchema,
  InsertGroup,
  InsertNationalSectionPositions,
  InsertNationalSectionPositionsLang,
  nationalSectionPositionsLang,
  nationalSections,
  nationalSectionsLang,
  nationalSectionsPositions,
  rolesTable,
  socialMediaLinks,
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
import { and, eq, getTableColumns, SQL, sql } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { PgTable } from "drizzle-orm/pg-core";

const preparedLanguagesByCode = db.query.languages
  .findFirst({
    where: (languages, { eq }) => eq(languages.code, sql.placeholder("locale")),
  })
  .prepare("query_language_by_code");

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

export async function uploadFile(
  file: File,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
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
  formData: FormData
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
    "generalDirectorProfile"
  ) as string;
  const artisticDirectorName = formData.get("artisticDirectorName") as string;
  const artisticDirectorProfile = formData.get(
    "artisticDirectorProfile"
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
  const t = await getTranslations("notification");

  const nsId = Number(formData.get("id"));
  const name = formData.get("_lang.name") as string;
  const about = formData.get("_lang.about") as string;
  const aboutYoung = formData.get("_lang.aboutYoung") as string;

  const socialId = Number(formData.get("_social.id"));
  const facebookLink = (formData.get("_social.facebookLink") as string) || null;
  const instagramLink =
    (formData.get("_social.instagramLink") as string) || null;
  const websiteLink = (formData.get("_social.websiteLink") as string) || null;

  const positionSize = Number(formData.get("_positionSize"));
  const honorarySize = Number(formData.get("_honorarySize"));
  const festivalSize = Number(formData.get("_festivalSize"));
  const groupSize = Number(formData.get("_groupSize"));

  const positions: InsertNationalSectionPositions[] = [];
  const positionLangs: InsertNationalSectionPositionsLang[] = [];

  const honoraries: InsertNationalSectionPositions[] = [];
  const honoraryLangs: InsertNationalSectionPositionsLang[] = [];

  const lang = await preparedLanguagesByCode.execute({ locale });
  const currentNationalSection = await db.query.nationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, nsId);
    },
  });

  if (!lang) {
    return { error: "Unrecognized locale" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(nationalSectionsLang)
      .set({ name, about, aboutYoung })
      .where(
        and(
          eq(nationalSectionsLang.nsId, nsId),
          eq(nationalSectionsLang.lang, lang.id)
        )
      );

    const [currentSocialMediaLink] = await tx
      .insert(socialMediaLinks)
      .values({
        id: !socialId ? undefined : socialId,
        facebookLink,
        instagramLink,
        websiteLink,
      })
      .onConflictDoUpdate({
        target: socialMediaLinks.id,
        set: buildConflictUpdateColumns(socialMediaLinks, [
          "facebookLink",
          "instagramLink",
          "websiteLink",
        ]),
      })
      .returning({ id: socialMediaLinks.id });

    if (!currentNationalSection?.socialMediaLinksId) {
      await tx.update(nationalSections).set({
        socialMediaLinksId: currentSocialMediaLink.id,
      });
    }

    if (positionSize > 0) {
      for (let index = 0; index < positionSize; index++) {
        const id = Number(formData.get(`_positions.${index}.id`));
        const name = formData.get(`_positions.${index}.name`) as string;
        const email = formData.get(`_positions.${index}.email`) as string;
        const phone = formData.get(`_positions.${index}.phone`) as string;
        const positionLangId = Number(
          formData.get(`_positions.${index}._lang.id`)
        );
        const shortBio = formData.get(
          `_positions.${index}._lang.shortBio`
        ) as string;
        const photo = formData.get(`_positions.${index}._photo`) as File;

        const storagePhotoId = await uploadFile(photo, tx);
        console.log({ storagePhotoId });

        positions.push({
          id: id === 0 ? undefined : id,
          name,
          email,
          phone,
          photoId: storagePhotoId,
          nsId: nsId,
        });

        positionLangs.push({
          id: id === 0 ? undefined : positionLangId,
          shortBio,
        });
      }

      const nationalSectionsElements = await tx
        .insert(nationalSectionsPositions)
        .values(positions)
        .onConflictDoUpdate({
          target: nationalSectionsPositions.id,
          set: buildConflictUpdateColumns(nationalSectionsPositions, [
            "name",
            "email",
            "phone",
          ]),
        })
        .returning({ id: nationalSectionsPositions.id });

      const outputNS = nationalSectionsElements.map((item, index) => ({
        id: positionLangs.at(index)?.id,
        nsPositionsId: item.id,
        shortBio: positionLangs.at(index)?.shortBio!,
        lang: lang.id,
      }));

      await tx
        .insert(nationalSectionPositionsLang)
        .values(outputNS)
        .onConflictDoUpdate({
          target: nationalSectionPositionsLang.id,
          set: buildConflictUpdateColumns(nationalSectionPositionsLang, [
            "shortBio",
          ]),
        });
    }

    if (honorarySize > 0) {
      for (let index = 0; index < honorarySize; index++) {
        const id = Number(formData.get(`_honoraries.${index}.id`));
        const name = formData.get(`_honoraries.${index}.name`) as string;
        console.log({ name });
        const email = formData.get(`_honoraries.${index}.email`) as string;
        const phone = formData.get(`_honoraries.${index}.phone`) as string;
        const positionLangId = Number(
          formData.get(`_honoraries.${index}._lang.id`)
        );
        const shortBio = formData.get(
          `_honoraries.${index}._lang.shortBio`
        ) as string;
        const photo = formData.get(`_honoraries.${index}._photo`) as File;
        const birthDate = formData.get(
          `_honoraries.${index}._birthDate`
        ) as string;
        const deathDate = formData.get(
          `_honoraries.${index}._deathDate`
        ) as string;

        const storagePhotoId = await uploadFile(photo, tx);

        honoraries.push({
          id: id === 0 ? undefined : id,
          name,
          email: email || "",
          phone: phone || "",
          isHonorable: true,
          photoId: storagePhotoId,
          nsId: nsId,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          deadDate: deathDate ? new Date(deathDate) : undefined,
        });

        honoraryLangs.push({
          id: id === 0 ? undefined : positionLangId,
          shortBio,
        });
      }

      const nationalSectionsElements = await tx
        .insert(nationalSectionsPositions)
        .values(honoraries)
        .onConflictDoUpdate({
          target: nationalSectionsPositions.id,
          set: buildConflictUpdateColumns(nationalSectionsPositions, [
            "name",
            "email",
            "phone",
            "birthDate",
            "deadDate",
          ]),
        })
        .returning({ id: nationalSectionsPositions.id });

      const outputNS = nationalSectionsElements.map((item, index) => ({
        id: honoraryLangs.at(index)?.id,
        nsPositionsId: item.id,
        shortBio: honoraryLangs.at(index)?.shortBio!,
        lang: lang.id,
      }));

      await tx
        .insert(nationalSectionPositionsLang)
        .values(outputNS)
        .onConflictDoUpdate({
          target: nationalSectionPositionsLang.id,
          set: buildConflictUpdateColumns(nationalSectionPositionsLang, [
            "shortBio",
          ]),
        });
    }
  });

  return { success: t("success") };
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

  // await db.transaction(async (tx) => {
  //   const [{ nationalSectionId }] = await tx
  //     .insert(nationalSections)
  //     .values({
  //       // ownerId: session?.user?.id,
  //       countryId: session?.user?.countryId,
  //     })
  //     .returning({
  //       nationalSectionId: nationalSections.id,
  //     });

  //   await tx
  //     .insert(nationalSectionsLang)
  //     .values({ name, about, aboutYoung, lang: 1, nsId: nationalSectionId });

  //   for (let index = 0; index < positionSize; index++) {
  //     const name = formData.get(`_positions.${index}.name`) as string;
  //     const email = formData.get(`_positions.${index}.email`) as string;
  //     const phone = formData.get(`_positions.${index}.phone`) as string;
  //     const shortBio = formData.get(
  //       `_positions.${index}._lang.shortBio`,
  //     ) as string;
  //     const photo = formData.get(`_festivals.${index}._photo`) as File;

  //     const storagePhotoId = await uploadFile(photo, tx);

  //     const [{ nsPositionsId }] = await tx
  //       .insert(nationalSectionsPositions)
  //       .values({
  //         name,
  //         email,
  //         phone,
  //         photoId: storagePhotoId,
  //         nsId: nationalSectionId,
  //       })
  //       .returning({ nsPositionsId: nationalSectionsPositions.id });

  //     await tx
  //       .insert(nationalSectionPositionsLang)
  //       .values({ nsPositionsId, shortBio });
  //   }

  //   for (let index = 0; index < festivalSize; index++) {
  //     const name = formData.get(`_festivals.${index}.name`) as string;
  //     const email = formData.get(`_festivals.${index}.email`) as string;
  //     const certificationFile = formData.get(
  //       `_festivals.${index}.certificationFile`,
  //     ) as File;

  //     const storageCertificationFileId = await uploadFile(
  //       certificationFile,
  //       tx,
  //     );

  //     const role = await tx.query.rolesTable.findFirst({
  //       where: eq(rolesTable.name, "Festivals"),
  //     });

  //     const [user] = await tx
  //       .insert(users)
  //       .values({
  //         email,
  //         roleId: role?.id || null,
  //         countryId: session?.user?.countryId,
  //       })
  //       .onConflictDoUpdate({
  //         target: users.email,
  //         set: { email },
  //       })
  //       .returning();

  //     if (email) {
  //       await transport.sendMail({
  //         from: process.env.GMAIL_USER,
  //         to: [email],
  //         subject: `Request Verification your festival called ${name}`,
  //         text: "You need to verify your account on the platform the ",
  //       });
  //     }

  //     festivalsItems.push({
  //       name,
  //       certificationMemberId: storageCertificationFileId,
  //       ownerId: user.id,
  //     });
  //   }

  //   for (let index = 0; index < groupSize; index++) {
  //     const name = formData.get(`_groups.${index}.name`) as string;
  //     const email = formData.get(`_groups.${index}.email`) as string;
  //     const certificationFile = formData.get(
  //       `_groups.${index}.certificationFile`,
  //     ) as File;

  //     const storageCertificationFileId = await uploadFile(
  //       certificationFile,
  //       tx,
  //     );

  //     const role = await tx.query.rolesTable.findFirst({
  //       where: eq(rolesTable.name, "Groups"),
  //     });

  //     const [user] = await tx
  //       .insert(users)
  //       .values({
  //         email,
  //         roleId: role?.id || null,
  //         countryId: session?.user?.countryId,
  //       })
  //       .onConflictDoUpdate({
  //         target: users.email,
  //         set: { email },
  //       })
  //       .returning();

  //     if (email) {
  //       await transport.sendMail({
  //         from: process.env.GMAIL_USER,
  //         to: [email],
  //         subject: `Request Verification your festival called ${name}`,
  //         text: "You need to verify your account on the platform",
  //       });
  //     }

  //     groupsItems.push({
  //       name,
  //       certificationMemberId: storageCertificationFileId,
  //       ownerId: user.id,
  //       countryId: session?.user?.countryId,
  //     });
  //   }

  //   await tx.insert(festivals).values(festivalsItems);
  //   await tx.insert(groups).values(groupsItems);

  //   return nationalSectionId;
  // });

  revalidatePath("/dashboard/national-sections");
  redirect("/dashboard/national-sections");
}
