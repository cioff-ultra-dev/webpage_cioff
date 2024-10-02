"use server";

import {
  emailTemplates,
  events,
  eventsLang,
  festivals,
  festivalsLang,
  groups,
  groupsLang,
  InsertEvent,
  InsertEventLang,
  InsertFestival,
  insertFestivalSchema,
  InsertGroup,
  InsertNationalSectionPositions,
  InsertNationalSectionPositionsLang,
  nationalSectionPositionsLang,
  nationalSections,
  nationalSectionsLang,
  nationalSectionsPositions,
  owners,
  roles,
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
import { replaceTags } from "@codejamboree/replace-tags";
import generator from "generate-password-ts";
import { generateHashPassword } from "@/lib/password";
import { headers } from "next/headers";

const preparedLanguagesByCode = db.query.languages
  .findFirst({
    where: (languages, { eq }) => eq(languages.code, sql.placeholder("locale")),
  })
  .prepare("query_language_by_code");

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

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
    const generalDirectorPhotoId = await uploadFile(directorPhoto, tx);

    await tx
      .update(groups)
      .set({
        generalDirectorName,
        generalDirectorPhotoId,
        artisticDirectorName,
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
  const festivalSize = Number(formData.get("_festivalSize"));
  const eventSize = Number(formData.get("_eventSize"));
  const groupSize = Number(formData.get("_groupSize"));

  const positions: InsertNationalSectionPositions[] = [];
  const positionLangs: InsertNationalSectionPositionsLang[] = [];

  const otherEvents: InsertEvent[] = [];
  const otherEventLangs: InsertEventLang[] = [];

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
          eq(nationalSectionsLang.lang, lang.id),
        ),
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
      await tx
        .update(nationalSections)
        .set({
          socialMediaLinksId: currentSocialMediaLink.id,
        })
        .where(eq(nationalSections.id, nsId));
    }

    if (positionSize > 0) {
      for (let index = 0; index < positionSize; index++) {
        const id = Number(formData.get(`_positions.${index}.id`));
        const name = formData.get(`_positions.${index}.name`) as string;
        const email = formData.get(`_positions.${index}.email`) as string;
        const phone = formData.get(`_positions.${index}.phone`) as string;
        const positionLangId = Number(
          formData.get(`_positions.${index}._lang.id`),
        );
        const shortBio = formData.get(
          `_positions.${index}._lang.shortBio`,
        ) as string;
        const photo = formData.get(`_positions.${index}._photo`) as File;
        const isHonorable =
          (formData.get(`_positions.${index}._isHonorable`) as string) === "on";
        const birthDate = formData.get(
          `_positions.${index}._birthDate`,
        ) as string;
        const deathDate = formData.get(
          `_positions.${index}._deathDate`,
        ) as string;

        const storagePhotoId = await uploadFile(photo, tx);

        positions.push({
          id: id === 0 ? undefined : id,
          name,
          email,
          phone,
          photoId: storagePhotoId,
          nsId: nsId,
          isHonorable,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          deadDate: deathDate ? new Date(deathDate) : undefined,
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
            "photoId",
            "isHonorable",
            "birthDate",
            "deadDate",
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

    if (eventSize > 0) {
      for (let index = 0; index < eventSize; index++) {
        const id = Number(formData.get(`_events.${index}.id`));
        const name = formData.get(`_events.${index}._lang.name`) as string;
        const description = formData.get(
          `_events.${index}._lang.description`,
        ) as string;
        const eventLangId = Number(formData.get(`_events.${index}._lang.id`));
        const fromDate = formData.get(
          `_events.${index}._rangeDate.from`,
        ) as string;
        const toDate = formData.get(`_events.${index}._rangeDate.to`) as string;

        otherEvents.push({
          id: id === 0 ? undefined : id,
          nsId,
          startDate: fromDate ? new Date(fromDate) : undefined,
          endDate: toDate ? new Date(toDate) : new Date(fromDate),
        });

        otherEventLangs.push({
          id: eventLangId === 0 ? undefined : eventLangId,
          name,
          description,
        });
      }

      const otherEventsElements = await tx
        .insert(events)
        .values(otherEvents)
        .onConflictDoUpdate({
          target: events.id,
          set: buildConflictUpdateColumns(events, ["startDate", "endDate"]),
        })
        .returning({ id: events.id });

      const outputEvents = otherEventsElements.map((item, index) => ({
        id: otherEventLangs.at(index)?.id,
        eventId: item.id,
        name: otherEventLangs.at(index)?.name!,
        description: otherEventLangs.at(index)?.description!,
        lang: lang.id,
      }));

      console.log(otherEventLangs, outputEvents);

      await tx
        .insert(eventsLang)
        .values(outputEvents)
        .onConflictDoUpdate({
          target: eventsLang.id,
          set: buildConflictUpdateColumns(eventsLang, ["name", "description"]),
        });
    }

    if (festivalSize > 0) {
      for (let index = 0; index < festivalSize; index++) {
        const id = Number(formData.get(`_festivals.${index}.id`));
        const name = formData.get(`_festivals.${index}._lang.name`) as string;
        const email = formData.get(`_festivals.${index}.email`) as string;
        const festivalLangId = Number(
          formData.get(`_festivals.${index}._lang.id`),
        );
        const ownerId = Number(formData.get(`_festivals.${index}.ownerId`));
        const certificationFile = formData.get(
          `_festivals.${index}.certificationFile`,
        ) as File;

        const storageCertificationFileId = await uploadFile(
          certificationFile,
          tx,
        );

        const role = await tx.query.roles.findFirst({
          where: eq(roles.name, "Festivals"),
        });

        const [user] = await tx
          .insert(users)
          .values({
            email,
            roleId: role?.id,
            countryId: currentNationalSection?.countryId,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: buildConflictUpdateColumns(users, ["email", "countryId"]),
          })
          .returning();

        if (user.email && !user.isCreationNotified && !user.emailVerified) {
          await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: [user.email],
            subject: `[REQUEST] - Verification your festival called ${name}`,
            text: "You need to verify your account on the platform the ",
          });

          await tx
            .update(users)
            .set({ isCreationNotified: true })
            .where(eq(users.id, user.id));
        }

        const [currentFestival] = await tx
          .insert(festivals)
          .values({
            id: id === 0 ? undefined : id,
            certificationMemberId: storageCertificationFileId,
            nsId,
            countryId: currentNationalSection?.countryId,
          })
          .onConflictDoUpdate({
            target: festivals.id,
            set: buildConflictUpdateColumns(festivals, [
              "certificationMemberId",
              "countryId",
            ]),
          })
          .returning();

        await tx
          .insert(festivalsLang)
          .values({
            id: festivalLangId === 0 ? undefined : festivalLangId,
            name,
            festivalId: currentFestival.id,
            lang: lang.id,
          })
          .onConflictDoUpdate({
            target: festivalsLang.id,
            set: buildConflictUpdateColumns(festivalsLang, ["name"]),
          });

        await tx
          .insert(owners)
          .values({
            id: ownerId === 0 ? undefined : ownerId,
            userId: user.id,
            festivalId: currentFestival.id,
          })
          .onConflictDoUpdate({
            target: owners.id,
            set: buildConflictUpdateColumns(owners, ["userId"]),
          });
      }
    }

    if (groupSize > 0) {
      for (let index = 0; index < groupSize; index++) {
        const id = Number(formData.get(`_groups.${index}.id`));
        const name = formData.get(`_groups.${index}._lang.name`) as string;
        const email = formData.get(`_groups.${index}.email`) as string;
        const groupLangId = Number(formData.get(`_groups.${index}._lang.id`));
        const ownerId = Number(formData.get(`_groups.${index}.ownerId`));
        const certificationFile = formData.get(
          `_groups.${index}.certificationFile`,
        ) as File;

        const storageCertificationFileId = await uploadFile(
          certificationFile,
          tx,
        );

        const role = await tx.query.roles.findFirst({
          where: eq(roles.name, "Groups"),
        });

        const [user] = await tx
          .insert(users)
          .values({
            email,
            roleId: role?.id,
            countryId: currentNationalSection?.countryId,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: buildConflictUpdateColumns(users, ["email", "countryId"]),
          })
          .returning();

        if (user.email && !user.isCreationNotified && !user.emailVerified) {
          await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: [user.email],
            subject: `[REQUEST] - Verification your group called ${name}`,
            text: "You need to verify your account on the platform the ",
          });

          await tx
            .update(users)
            .set({ isCreationNotified: true })
            .where(eq(users.id, user.id));
        }

        const [currentGroup] = await tx
          .insert(groups)
          .values({
            id: id === 0 ? undefined : id,
            certificationMemberId: storageCertificationFileId,
            nsId,
            countryId: currentNationalSection?.countryId,
          })
          .onConflictDoUpdate({
            target: groups.id,
            set: buildConflictUpdateColumns(groups, [
              "certificationMemberId",
              "countryId",
            ]),
          })
          .returning();

        await tx
          .insert(groupsLang)
          .values({
            id: groupLangId === 0 ? undefined : groupLangId,
            name,
            groupId: currentGroup.id,
            lang: lang.id,
          })
          .onConflictDoUpdate({
            target: groupsLang.id,
            set: buildConflictUpdateColumns(groupsLang, ["name"]),
          });

        await tx
          .insert(owners)
          .values({
            id: ownerId === 0 ? undefined : ownerId,
            userId: user.id,
            groupId: currentGroup.id,
          })
          .onConflictDoUpdate({
            target: owners.id,
            set: buildConflictUpdateColumns(owners, ["userId"]),
          });
      }
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

  await db.transaction(async (tx) => {
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

      const role = await tx.query.roles.findFirst({
        where: eq(roles.name, "Festivals"),
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
        certificationMemberId: storageCertificationFileId,
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

      const role = await tx.query.roles.findFirst({
        where: eq(roles.name, "Groups"),
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
        certificationMemberId: storageCertificationFileId,
        countryId: session?.user?.countryId,
      });
    }

    await tx.insert(festivals).values(festivalsItems);
    await tx.insert(groups).values(groupsItems);
  });

  revalidatePath("/dashboard/national-sections");
  redirect("/dashboard/national-sections");
}

export async function generateFestival(formData: FormData) {
  const locale = await getLocale();
  const headerList = headers();
  const session = await auth();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const nsId = Number(formData.get("_nsId"));

  const t = await getTranslations("notification");
  const lang = await preparedLanguagesByCode.execute({ locale });
  const currentNationalSection = await db.query.nationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, nsId);
    },
  });

  try {
    await db.transaction(async (tx) => {
      const role = await tx.query.roles.findFirst({
        where: eq(roles.name, "Festivals"),
      });

      const password = generator.generate({ length: 10, numbers: true });
      const hashedPassword = await generateHashPassword(password);

      const [user] = await tx
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          roleId: role?.id,
          countryId: currentNationalSection?.countryId,
        })
        .returning();

      if (user.email && !user.isCreationNotified && !user.emailVerified) {
        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(eq(emailTemplates.lang, lang?.id!));

        const message = replaceTags(emailTemplate.template, {
          name: name,
          password: password,
          url: `<a href="${process.env.HOSTNAME_URL}/login">Login on CIOFF</a>`,
        });

        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [user.email],
          subject: `Festival User Invitation - CIOFF`,
          html: message,
        });

        await tx
          .update(users)
          .set({ isCreationNotified: true })
          .where(eq(users.id, user.id));
      }

      const [currentFestival] = await tx
        .insert(festivals)
        .values({
          nsId,
          countryId: currentNationalSection?.countryId,
        })
        .returning();

      await tx.insert(festivalsLang).values({
        name,
        festivalId: currentFestival.id,
        lang: lang?.id,
      });

      const ownerList: (typeof owners.$inferInsert)[] = [
        { userId: user.id, festivalId: currentFestival.id },
      ];

      if (session?.user.role?.name === "National Sections") {
        ownerList.push({
          userId: session.user.id,
          festivalId: currentFestival.id,
        });
      }

      await tx
        .insert(owners)
        .values(ownerList)
        .onConflictDoUpdate({
          target: owners.id,
          set: buildConflictUpdateColumns(owners, ["userId"]),
        });
    });
  } catch (err) {
    const e = err as { constraint: string };

    if (e.constraint === "emailUniqueIndex") {
      return { error: t("email_exist") };
    }

    const er = err as Error;
    return { error: er.message };
  }

  return { success: t("success"), error: null };
}
