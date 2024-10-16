"use server";

import {
  categories,
  emailTemplates,
  events,
  eventsLang,
  festivals,
  festivalsLang,
  festivalToCategories,
  groups,
  groupsLang,
  groupToCategories,
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
  videoTutorialLinks,
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
import { generateHashPassword, isSamePassword } from "@/lib/password";
import slug from "slug";
import build from "next/dist/build";

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
  formData.set("redirectTo", "/dashboard");
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

  revalidatePath("/dashboard");
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

export async function updateNationalSection(formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations("notification");

  const nsId = Number(formData.get("id"));
  const langId = Number(formData.get("_lang.id"));
  const name = formData.get("_lang.name") as string;
  const about = formData.get("_lang.about") as string;
  // const aboutYoung = formData.get("_lang.aboutYoung") as string;

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
    const [currentNationaSectionLang] = await tx
      .insert(nationalSectionsLang)
      .values({
        id: !langId ? undefined : langId,
        name,
        about,
        lang: lang.id,
        nsId,
      })
      .onConflictDoUpdate({
        target: nationalSectionsLang.id,
        set: buildConflictUpdateColumns(nationalSectionsLang, [
          "name",
          "about",
        ]),
      })
      .returning();

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
        const typeId = Number(formData.get(`_positions.${index}._type`));
        const otherMemberName = formData.get(
          `_positions.${index}._lang.otherMemberName`,
        ) as string;
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
          typePositionId: !typeId ? undefined : typeId,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          deadDate: deathDate ? new Date(deathDate) : undefined,
        });

        positionLangs.push({
          id: positionLangId === 0 ? undefined : positionLangId,
          shortBio,
          otherMemberName,
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
            "typePositionId",
          ]),
        })
        .returning({ id: nationalSectionsPositions.id });

      const outputNS = nationalSectionsElements.map((item, index) => ({
        id: positionLangs.at(index)?.id,
        nsPositionsId: item.id,
        shortBio: positionLangs.at(index)?.shortBio!,
        otherMemberName: positionLangs.at(index)?.otherMemberName,
        lang: lang.id,
      }));

      await tx
        .insert(nationalSectionPositionsLang)
        .values(outputNS)
        .onConflictDoUpdate({
          target: nationalSectionPositionsLang.id,
          set: buildConflictUpdateColumns(nationalSectionPositionsLang, [
            "shortBio",
            "otherMemberName",
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

        if (fromDate) {
          otherEvents.push({
            id: id === 0 ? undefined : id,
            nsId,
            startDate: new Date(fromDate),
            endDate: toDate ? new Date(toDate) : new Date(fromDate),
          });
        }

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

        const password = generator.generate({ length: 10, numbers: true });
        const hashedPassword = await generateHashPassword(password);

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

        if (user.email && !user.isCreationNotified) {
          const currentCountry = await tx.query.countries.findFirst({
            where(fields, { eq }) {
              return eq(fields.id, user.countryId!);
            },
          });

          const [emailTemplate] = await db
            .select()
            .from(emailTemplates)
            .where(
              and(
                eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
                eq(emailTemplates.tag, "festival-group"),
              ),
            );

          const message = replaceTags(emailTemplate.template, {
            name: name,
            password: password,
            url: `<a target="_blank" href="${
              process.env.HOSTNAME_URL
            }/login">${t("email.login_to")}</a>`,
          });

          await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: [user.email],
            subject: t("email.activation_account"),
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
            id: id === 0 ? undefined : id,
            certificationMemberId: storageCertificationFileId,
            nsId,
            countryId: currentNationalSection?.countryId,
            slug: slug(name),
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

        if (user.email && !user.isCreationNotified) {
          const currentCountry = await tx.query.countries.findFirst({
            where(fields, { eq }) {
              return eq(fields.id, user.countryId!);
            },
          });

          const [emailTemplate] = await db
            .select()
            .from(emailTemplates)
            .where(
              and(
                eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
                eq(emailTemplates.tag, "festival-group"),
              ),
            );

          const message = replaceTags(emailTemplate.template, {
            name: name,
            // password: password,
            url: `<a target="_blank" href="${
              process.env.HOSTNAME_URL
            }/login">${t("email.login_to")}</a>`,
          });

          await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: [user.email],
            subject: t("email.activation_account"),
            html: message,
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
  const locale = await getLocale();
  const t = await getTranslations("notification");
  const session = await auth();
  const name = formData.get("_lang.name") as string;
  const about = formData.get("_lang.about") as string;
  const aboutYoung = formData.get("_lang.aboutYoung") as string;

  const positionSize = Number(formData.get("_positionSize"));
  const festivalSize = Number(formData.get("_festivalSize"));
  const groupSize = Number(formData.get("_groupSize"));

  const festivalsItems: InsertFestival[] = [];
  const groupsItems: InsertGroup[] = [];

  const lang = await preparedLanguagesByCode.execute({ locale });

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

      if (user.email && !user.isCreationNotified) {
        const currentCountry = await tx.query.countries.findFirst({
          where(fields, { eq }) {
            return eq(fields.id, user.countryId!);
          },
        });

        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
              eq(emailTemplates.tag, "festival-group"),
            ),
          );

        const message = replaceTags(emailTemplate.template, {
          name: name,
          // password: password,
          email: user.email,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to",
          )}</a>`,
        });

        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [user.email],
          subject: t("email.activation_account"),
          html: message,
        });

        await tx
          .update(users)
          .set({ isCreationNotified: true })
          .where(eq(users.id, user.id));
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

      if (user.email && !user.isCreationNotified) {
        const currentCountry = await tx.query.countries.findFirst({
          where(fields, { eq }) {
            return eq(fields.id, user.countryId!);
          },
        });

        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
              eq(emailTemplates.tag, "festival-group"),
            ),
          );

        const message = replaceTags(emailTemplate.template, {
          name: name,
          // password: password,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to",
          )}</a>`,
        });

        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [user.email],
          subject: t("email.activation_account"),
          html: message,
        });

        await tx
          .update(users)
          .set({ isCreationNotified: true })
          .where(eq(users.id, user.id));
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

      const [currentFestival] = await tx
        .insert(festivals)
        .values({
          nsId,
          countryId: currentNationalSection?.countryId,
          slug: slug(name),
        })
        .returning();

      await tx.insert(festivalsLang).values({
        name,
        festivalId: currentFestival.id,
        lang: lang?.id,
      });

      if (user.email && !user.isCreationNotified) {
        const currentCountry = await tx.query.countries.findFirst({
          where(fields, { eq }) {
            return eq(fields.id, user.countryId!);
          },
        });

        const nsLang = await tx.query.nationalSectionsLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.nsId, nsId),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        const [video] = await tx
          .select()
          .from(videoTutorialLinks)
          .where(
            and(
              eq(videoTutorialLinks.lang, currentCountry?.nativeLang! ?? 1),
              eq(videoTutorialLinks.role, role?.id!),
            ),
          );

        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
              eq(emailTemplates.tag, "festival-group"),
            ),
          );
        const message = replaceTags(emailTemplate.template, {
          name: name,
          password: password,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to",
          )}</a>`,
          email: user.email,
          video: `<a target="_blank" href="${video.link}">Video</a>`,
          nsName: nsLang?.name ?? "",
        });

        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [user.email],
          subject: emailTemplate.subject || t("email.activation_account"),
          html: message,
        });

        await tx
          .update(users)
          .set({ isCreationNotified: true })
          .where(eq(users.id, user.id));
      }

      const ownerList: (typeof owners.$inferInsert)[] = [
        {
          userId: user.id,
          festivalId: currentFestival.id,
          nsId: currentNationalSection?.id,
        },
      ];

      // if (session?.user.role?.name === "National Sections") {
      //   ownerList.push({
      //     userId: session.user.id,
      //     festivalId: currentFestival.id,
      //   });
      // }

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

export async function generateGroup(formData: FormData) {
  const locale = await getLocale();
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
        where: eq(roles.name, "Groups"),
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

      if (user.email && !user.isCreationNotified) {
        const currentCountry = await tx.query.countries.findFirst({
          where(fields, { eq }) {
            return eq(fields.id, user.countryId!);
          },
        });

        const nsLang = await tx.query.nationalSectionsLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.nsId, nsId),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        const [video] = await tx
          .select()
          .from(videoTutorialLinks)
          .where(
            and(
              eq(videoTutorialLinks.lang, currentCountry?.nativeLang! ?? 1),
              eq(videoTutorialLinks.role, role?.id!),
            ),
          );

        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
              eq(emailTemplates.tag, "festival-group"),
            ),
          );

        const message = replaceTags(emailTemplate.template, {
          name: name,
          password: password,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to",
          )}</a>`,
          email: user.email,
          video: `<a target="_blank" href="${video.link}">Video</a>`,
          nsName: nsLang?.name ?? "",
        });

        await transport.sendMail({
          from: process.env.GMAIL_USER,
          to: [user.email],
          subject: emailTemplate.subject || t("email.activation_account"),
          html: message,
        });

        await tx
          .update(users)
          .set({ isCreationNotified: true })
          .where(eq(users.id, user.id));
      }

      const [currentGroup] = await tx
        .insert(groups)
        .values({
          nsId,
          countryId: currentNationalSection?.countryId,
        })
        .returning();

      await tx.insert(groupsLang).values({
        name,
        groupId: currentGroup.id,
        lang: lang?.id,
      });

      const ownerList: (typeof owners.$inferInsert)[] = [
        {
          userId: user.id,
          groupId: currentGroup.id,
          nsId: currentNationalSection?.id,
        },
      ];

      // if (session?.user.role?.name === "National Sections") {
      //   ownerList.push({
      //     userId: session.user.id,
      //     groupId: currentGroup.id,
      //   });
      // }

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

export async function updateAccountFields(formData: FormData) {
  const session = await auth();
  const firstName = formData.get("firstname") as string;
  const lastName = formData.get("lastname") as string;
  const email = formData.get("email") as string;

  const t = await getTranslations("notification");

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          firstname: firstName,
          lastname: lastName,
          email,
        })
        .where(eq(users.id, session?.user?.id!));
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

export async function updatePasswordFields(formData: FormData) {
  const session = await auth();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const t = await getTranslations("notification");
  const hashedPassword = await generateHashPassword(confirmPassword);

  try {
    const result = await db.transaction(async (tx) => {
      const currentUser = await tx.query.users.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, session?.user.id!);
        },
      });

      if (!currentUser) {
        tx.rollback();
      }

      const isMatchPassword = await isSamePassword(
        currentPassword,
        currentUser?.password!,
      );

      if (!isMatchPassword) {
        return { error: "Your current password isn't correct" };
      }

      await tx
        .update(users)
        .set({
          password: hashedPassword,
          active: true,
        })
        .where(eq(users.id, session?.user?.id!));
    });

    if (result?.error) {
      return { error: result.error };
    }
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

export async function updateFestival(formData: FormData) {
  const locale = await getLocale();
  const id = Number(formData.get("id"));
  const langId = Number(formData.get("_lang.id"));
  const name = formData.get("_lang.name") as string;
  const directorName = formData.get("directorName") as string;
  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const translatorLanguages = formData.get("translatorLanguages") as string;
  const peoples = Number(formData.get("peoples"));
  const statusId = Number((formData.get("_status") as string) ?? "") || null;
  const otherTranslatorLanguage = formData.get(
    "_lang.otherTranslatorLanguage",
  ) as string;
  const groupCategories = JSON.parse(
    (formData.get("groupCategories") as string) || "",
  ) as string[];

  const socialId = Number(formData.get("socialId"));
  const facebookLink = (formData.get("facebook") as string) || null;
  const instagramLink = (formData.get("instagram") as string) || null;
  const websiteLink = (formData.get("website") as string) || null;

  const currentDateSize = Number(formData.get("_currentDateSize"));
  const nextDateSize = Number(formData.get("_nextDateSize"));

  const currentDates: InsertEvent[] = [];

  const lang = await preparedLanguagesByCode.execute({ locale });
  const t = await getTranslations("notification");

  await db.transaction(async (tx) => {
    const [currentFestival] = await tx
      .insert(festivals)
      .values({
        id: id === 0 ? undefined : id,
        directorName,
        phone,
        location,
        translatorLanguages,
        peoples,
        statusId,
        lat,
        lng,
      })
      .onConflictDoUpdate({
        target: festivals.id,
        set: buildConflictUpdateColumns(festivals, [
          "directorName",
          "phone",
          "location",
          "lat",
          "lng",
          "translatorLanguages",
          "peoples",
          "statusId",
        ]),
      })
      .returning();

    await tx
      .insert(festivalsLang)
      .values({
        id: langId === 0 ? undefined : langId,
        name,
        otherTranslatorLanguage,
        festivalId: currentFestival.id,
        lang: lang?.id,
      })
      .onConflictDoUpdate({
        target: festivalsLang.id,
        set: buildConflictUpdateColumns(festivalsLang, [
          "name",
          "otherTranslatorLanguage",
        ]),
      });

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

    if (!currentFestival?.socialMediaLinksId) {
      await tx
        .update(festivals)
        .set({
          socialMediaLinksId: currentSocialMediaLink.id,
        })
        .where(eq(festivals.id, currentFestival.id));
    }

    if (currentDateSize > 0) {
      for (let index = 0; index < currentDateSize; index++) {
        const id = Number(formData.get(`_currentDates.${index}._rangeDate.id`));
        const fromDate = formData.get(
          `_currentDates.${index}._rangeDate.from`,
        ) as string;
        const toDate = formData.get(
          `_currentDates.${index}._rangeDate.to`,
        ) as string;

        if (fromDate) {
          currentDates.push({
            id: id === 0 ? undefined : id,
            festivalId: currentFestival.id,
            startDate: new Date(fromDate),
            endDate: toDate ? new Date(toDate) : new Date(fromDate),
          });
        }
      }
    }

    if (nextDateSize > 0) {
      for (let index = 0; index < currentDateSize; index++) {
        const id = Number(formData.get(`_nextDates.${index}._rangeDate.id`));
        const fromDate = formData.get(
          `_nextDates.${index}._rangeDate.from`,
        ) as string;
        const toDate = formData.get(
          `_nextDates.${index}._rangeDate.to`,
        ) as string;

        if (fromDate) {
          currentDates.push({
            id: id === 0 ? undefined : id,
            festivalId: currentFestival.id,
            startDate: new Date(fromDate),
            endDate: toDate ? new Date(toDate) : new Date(fromDate),
          });
        }
      }
    }

    if (currentDates.length) {
      await tx
        .insert(events)
        .values(currentDates)
        .onConflictDoUpdate({
          target: events.id,
          set: buildConflictUpdateColumns(events, ["startDate", "endDate"]),
        });
    }

    if (groupCategories.length) {
      await tx
        .delete(festivalToCategories)
        .where(eq(festivalToCategories.festivalId, currentFestival.id));

      await tx.insert(festivalToCategories).values(
        groupCategories.map((categoryId) => ({
          categoryId: Number(categoryId),
          festivalId: currentFestival.id,
        })),
      );
    }
  });

  return { success: t("success"), error: null };
}

export async function createGroup(prevState: unknown, formData: FormData) {
  const id = Number(formData.get("_id"));
  const generalDirectorName = formData.get("generalDirectorName") as string;
  const generalDirectorProfile = formData.get(
    "generalDirectorProfile",
  ) as string;
  const generalDirectorPhoto = formData.get("_generalDirectorPhoto") as File;

  const artisticDirectorName = formData.get("artisticDirectorName") as string;
  const artisticDirectorProfile = formData.get(
    "artisticDirectorProfile",
  ) as string;
  const artisticDirectorPhoto = formData.get("_artisticDirectorPhoto") as File;

  const musicalDirectorName = formData.get("musicalDirectorName") as string;
  const musicalDirectorProfile = formData.get(
    "musicalDirectorProfile",
  ) as string;
  const musicalDirectorPhoto = formData.get("_musicalDirectorPhoto") as File;

  await db.transaction(async (tx) => {
    const generalDirectorPhotoId = await uploadFile(generalDirectorPhoto, tx);
    const artisticDirectorPhotoId = await uploadFile(artisticDirectorPhoto, tx);
    const musicalDirectorPhotoId = await uploadFile(musicalDirectorPhoto, tx);

    await tx
      .update(groups)
      .set({
        generalDirectorName,
        generalDirectorPhotoId,
        artisticDirectorName,
        artisticDirectorPhotoId,
        musicalDirectorName,
        musicalDirectorPhotoId,
      })
      .where(eq(groups.id, id));
  });

  revalidatePath("/dashboard/groups");
  redirect("/dashboard/groups");
}

export async function updateGroup(formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations("notification");

  const id = Number(formData.get("id"));
  const langId = Number(formData.get("_lang.id"));
  const name = formData.get("_lang.name") as string;
  const description = formData.get("_lang.description") as string;
  const generalDirectorName = formData.get("generalDirectorName") as string;
  const generalDirectorProfile = formData.get(
    "_lang.generalDirectorProfile",
  ) as string;
  const generalDirectorPhoto = formData.get("_generalDirectorPhoto") as File;
  const artisticDirectorName = formData.get("artisticDirectorName") as string;
  const artisticDirectorProfile = formData.get(
    "_lang.artisticDirectorProfile",
  ) as string;
  const artisticDirectorPhoto = formData.get("_artisticDirectorPhoto") as File;
  const phone = formData.get("phone") as string;
  const address = formData.get("_lang.address") as string;
  const membersNumber = formData.get("membersNumber") as string;
  const isAbleToTravel = (formData.get("_isAbleToTravel") as string) === "yes";
  const isAbleToTravelLiveMusic =
    (formData.get("_isAbleToTravelToLiveMusic") as string) === "on";

  const speficifDateFrom = formData.get("_specificDate.from") as string;
  const speficifDateTo = formData.get("_specificDate.to") as string;
  const specificRegionId = Number(formData.get("_specificRegion"));

  const facebookLink = (formData.get("facebook") as string) || null;
  const instagramLink = (formData.get("instagram") as string) || null;
  const websiteLink = (formData.get("website") as string) || null;
  const youtubeId = (formData.get("youtube") as string) || null;

  const typeGroups = JSON.parse(
    (formData.get("_typeOfGroup") as string) || "[]",
  );
  const groupAge = JSON.parse((formData.get("_groupAge") as string) || "[]");
  const styleGroup = JSON.parse(
    (formData.get("_styleOfGroup") as string) || "[]",
  );

  const groupCategories = [...typeGroups, ...groupAge, ...styleGroup];

  const lang = await preparedLanguagesByCode.execute({ locale });

  await db.transaction(async (tx) => {
    const generalDirectorPhotoId = await uploadFile(generalDirectorPhoto, tx);
    const artisticDirectorPhotoId = await uploadFile(artisticDirectorPhoto, tx);

    const [currentGroup] = await tx
      .update(groups)
      .set({
        generalDirectorName,
        generalDirectorPhotoId,
        artisticDirectorName,
        artisticDirectorPhotoId,
        phone,
        isAbleTravel: isAbleToTravel,
        isAbleTravelLiveMusic: isAbleToTravelLiveMusic,
        membersNumber: membersNumber ? Number(membersNumber) : null,
        specificTravelDateFrom: speficifDateFrom
          ? new Date(speficifDateFrom)
          : null,
        specificTravelDateTo: speficifDateTo ? new Date(speficifDateTo) : null,
        specificRegion: specificRegionId ? Number(specificRegionId) : null,
        facebookLink,
        instagramLink,
        websiteLink,
        youtubeId,
      })
      .where(eq(groups.id, id))
      .returning();

    await tx
      .insert(groupsLang)
      .values({
        id: langId === 0 ? undefined : langId,
        name,
        generalDirectorProfile,
        artisticDirectorProfile,
        address,
        description,
        groupId: currentGroup.id,
        lang: lang?.id,
      })
      .onConflictDoUpdate({
        target: groupsLang.id,
        set: buildConflictUpdateColumns(groupsLang, [
          "name",
          "generalDirectorProfile",
          "artisticDirectorProfile",
          "address",
          "description",
        ]),
      });

    if (groupCategories.length) {
      await tx
        .delete(groupToCategories)
        .where(eq(groupToCategories.groupId, currentGroup.id));

      await tx.insert(groupToCategories).values(
        groupCategories.map((categoryId) => ({
          categoryId: Number(categoryId),
          groupId: currentGroup.id,
        })),
      );
    }
  });

  return { success: t("success"), error: null };
}

export async function sendInvitationLegacy(formData: FormData) {
  const email = formData.get("email") as string;
  const festivalId = Number(formData.get("festival_id"));
  const session = await auth();
  const t = await getTranslations("notification");

  return { success: t("success") };
}
