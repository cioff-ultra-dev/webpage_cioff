"use server";

import {
  emailTemplates,
  events,
  eventsLang,
  festivalCoverPhotos,
  festivalPhotos,
  festivals,
  festivalsGroupToRegions,
  festivalsLang,
  festivalStagePhotos,
  festivalsToComponents,
  festivalsToConnected,
  festivalsToGroups,
  festivalsToStatuses,
  festivalToCategories,
  groupCoverPhotos,
  groupPhotos,
  groupPhotosRelations,
  groups,
  groupsLang,
  groupToCategories,
  InsertEvent,
  InsertEventLang,
  InsertFestival,
  InsertFestivalLang,
  InsertFestivalPhotos,
  insertFestivalSchema,
  InsertFestivalStagePhotos,
  InsertFestivalToConnected,
  InsertFestivalToGroups,
  InsertGroup,
  InsertGroupLang,
  InsertGroupPhotos,
  InsertNationalSectionLang,
  InsertNationalSectionPositions,
  InsertNationalSectionPositionsLang,
  InsertRepertoryLang,
  InsertSubGroupLang,
  InsertTransportLocations,
  nationalSectionPositionsLang,
  nationalSections,
  nationalSectionsLang,
  nationalSectionsPositions,
  owners,
  repertories,
  repertoriesLang,
  roles,
  SelectFestivalPhotos,
  socialMediaLinks,
  storages,
  subgroups,
  subgroupsLang,
  subgroupToCategories,
  transportLocations,
  users,
  videoTutorialLinks,
  nationalCoverPhotos,
} from "@/db/schema";
import { transport } from "@/lib/mailer";
import { put, del } from "@vercel/blob";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { newFestival } from "@/db/queries/events";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { and, eq, getTableColumns, inArray, SQL, sql } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { PgTable } from "drizzle-orm/pg-core";
import { replaceTags } from "@codejamboree/replace-tags";
import generator from "generate-password-ts";
import { generateHashPassword, isSamePassword } from "@/lib/password";
import slug from "slug";
import { z } from "zod";
import { readFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { getTranslateText } from "@/lib/translate";
import { Locale, pickLocales } from "@/i18n/config";
import { group } from "console";

const urlStringSchema = z.string().trim().url();

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
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  rootPath: string = "root"
) {
  if (!file || file?.size === 0) {
    return undefined;
  }

  const blob = await put(`media/${rootPath}/${file.name}`, file, {
    access: "public",
  });

  const [result] = await tx
    .insert(storages)
    .values({ url: blob.url, name: blob.pathname })
    .returning({
      id: storages.id,
    });

  return result.id;
}

export async function uploadFileStreams(
  value: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  rootPath: string = "root",
  storageId?: number
) {
  if (!value && !storageId) {
    return undefined;
  }

  const isUrl = urlStringSchema.safeParse(value);

  if (storageId && (!value || typeof value !== "string")) {
    const currentStorage = await tx.query.storages.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, storageId);
      },
    });

    await tx
      .update(storages)
      .set({
        url: "",
        name: null,
      })
      .where(eq(storages.id, storageId));

    if (currentStorage && currentStorage.url) {
      await del(currentStorage.url);
    }

    return currentStorage?.id!;
  }

  if (storageId && isUrl.success && value && typeof value === "string") {
    const [updatedStorage] = await tx
      .update(storages)
      .set({
        url: value,
        name: value.split("/").at(-1),
      })
      .where(eq(storages.id, storageId))
      .returning();

    return updatedStorage.id;
  }

  if (!isUrl.success && value && typeof value === "string") {
    const currentPath = path.join(tmpdir(), value);
    const fileBuffer = await readFile(currentPath);
    const pathname = value.split("|").at(-1);

    const _file = await put(`media/${rootPath}/${pathname}`, fileBuffer, {
      access: "public",
    });

    await unlink(currentPath);

    const [result] = await tx
      .insert(storages)
      .values({
        id: storageId ? storageId : undefined,
        url: _file.url,
        name: _file.pathname.split("/").at(-1),
      })
      .onConflictDoUpdate({
        target: [storages.id],
        set: buildConflictUpdateColumns(storages, ["url", "name"]),
      })
      .returning();

    return result.id;
  }

  if (!storageId && isUrl.success && value && typeof value === "string") {
    const [newStorage] = await tx
      .insert(storages)
      .values({
        url: value,
        name: value.split("/").at(-1),
      })
      .returning();

    return newStorage.id;
  }
  return storageId!;
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
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

  const coverPhotos = JSON.parse(
    (formData.get("coverPhotosId") as string) || "[]"
  ) as { name: string; url: string }[];

  const positions: InsertNationalSectionPositions[] = [];
  const positionLangs: InsertNationalSectionPositionsLang[] = [];

  const otherEvents: InsertEvent[] = [];
  const otherEventLangs: InsertEventLang[] = [];

  const currentNationaSectionLangTranslates: Array<InsertNationalSectionLang> =
    [];

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
    const currentCountry = await tx.query.countries.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, currentNationalSection?.countryId!);
      },
      with: {
        nativeLang: true,
      },
    });

    if (coverPhotos.length && currentNationalSection?.id) {
      const coverPhotosRemoved = await tx
        .delete(nationalCoverPhotos)
        .where(
          eq(nationalCoverPhotos.nationalSectionId, currentNationalSection?.id)
        )
        .returning();

      await tx.delete(storages).where(
        inArray(
          storages.id,
          coverPhotosRemoved.map((item) => item.photoId!)
        )
      );

      const coverPhotosInserted = await tx
        .insert(storages)
        .values(
          coverPhotos.map((photo) => ({ url: photo.url, name: photo.name }))
        )
        .returning();

      await tx.insert(nationalCoverPhotos).values(
        coverPhotosInserted.map((item) => ({
          photoId: item.id,
          nationalSectionId: currentNationalSection?.id,
        }))
      );
    }

    if (currentCountry?.nativeLang?.code === locale) {
      const currentNationaSectionLangs =
        await tx.query.nationalSectionsLang.findMany({
          where(fields, { eq }) {
            return eq(fields.nsId, currentNationalSection?.id!);
          },
          with: {
            l: true,
          },
        });

      const nameTranslateResults = await getTranslateText(
        name,
        locale as Locale
      );
      const aboutTranslateResults = await getTranslateText(
        about,
        locale as Locale
      );

      const pickedLocales = pickLocales(locale);

      for await (const _currentLocale of pickedLocales) {
        const newLang = await preparedLanguagesByCode.execute({
          locale: _currentLocale,
        });

        const newName = nameTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        const newAbout = aboutTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        currentNationaSectionLangTranslates.push({
          id:
            currentNationaSectionLangs.find(
              (item) => item.l?.code === _currentLocale
            )?.id || undefined,
          name: newName?.result!,
          about: newAbout?.result,
          nsId: currentNationalSection?.id,
          lang:
            currentNationaSectionLangs.find(
              (item) => item.l?.code === _currentLocale
            )?.lang ||
            newLang?.id ||
            undefined,
        });
      }

      currentNationaSectionLangTranslates.push({
        id: langId === 0 ? undefined : langId,
        name,
        about,
        nsId: currentNationalSection?.id,
        lang: lang?.id,
      });
    } else {
      currentNationaSectionLangTranslates.push({
        id: langId === 0 ? undefined : langId,
        name,
        about,
        nsId: currentNationalSection?.id,
        lang: lang?.id,
      });
    }

    await tx
      .insert(nationalSectionsLang)
      .values(currentNationaSectionLangTranslates)
      .onConflictDoUpdate({
        target: nationalSectionsLang.id,
        set: buildConflictUpdateColumns(nationalSectionsLang, [
          "name",
          "about",
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
          formData.get(`_positions.${index}._lang.id`)
        );
        const typeId = Number(formData.get(`_positions.${index}._type`));
        const otherMemberName = formData.get(
          `_positions.${index}._lang.otherMemberName`
        ) as string;
        const shortBio = formData.get(
          `_positions.${index}._lang.shortBio`
        ) as string;
        const photo = formData.get(`_positions.${index}._photo`) as string;
        const photoId = Number(formData.get(`_positions.${index}._photo.id`));
        const isHonorable =
          (formData.get(`_positions.${index}._isHonorable`) as string) === "on";
        const birthDate = formData.get(
          `_positions.${index}._birthDate`
        ) as string;
        const deathDate = formData.get(
          `_positions.${index}._deathDate`
        ) as string;

        const storagePhotoId = await uploadFileStreams(
          photo,
          tx,
          "ns",
          photoId
        );

        const [currentNationaSectionPosition] = await tx
          .insert(nationalSectionsPositions)
          .values({
            id: id === 0 ? undefined : id,
            name,
            email,
            phone,
            photoId: storagePhotoId ? storagePhotoId : undefined,
            nsId: nsId,
            isHonorable,
            typePositionId: !typeId ? undefined : typeId,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            deadDate: deathDate ? new Date(deathDate) : undefined,
          })
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

        if (currentCountry?.nativeLang?.code === locale) {
          const currentPositionLangs =
            await tx.query.nationalSectionPositionsLang.findMany({
              where(fields, { eq }) {
                return eq(fields.nsPositionsId, id);
              },
              with: {
                l: true,
              },
            });

          const shortBioTranslateResults = await getTranslateText(
            shortBio,
            locale as Locale
          );
          const otherMemberNameTranslateResults = await getTranslateText(
            otherMemberName,
            locale as Locale
          );

          const pickedLocales = pickLocales(locale);

          for await (const _currentLocale of pickedLocales) {
            const newLang = await preparedLanguagesByCode.execute({
              locale: _currentLocale,
            });
            const newShortBio = shortBioTranslateResults.find(
              (item) => item.locale === _currentLocale
            );

            const newOtherMemeberName = otherMemberNameTranslateResults.find(
              (item) => item.locale === _currentLocale
            );

            positionLangs.push({
              id:
                currentPositionLangs.find(
                  (item) => item.l?.code === _currentLocale
                )?.id || undefined,
              shortBio: newShortBio?.result ?? "",
              otherMemberName: newOtherMemeberName?.result,
              nsPositionsId: currentNationaSectionPosition.id,
              lang:
                currentPositionLangs.find(
                  (item) => item.l?.code === _currentLocale
                )?.lang ||
                newLang?.id ||
                undefined,
            });
          }

          positionLangs.push({
            id: positionLangId === 0 ? undefined : positionLangId,
            shortBio,
            otherMemberName,
            nsPositionsId: currentNationaSectionPosition.id,
            lang: lang.id,
          });
        } else {
          positionLangs.push({
            id: positionLangId === 0 ? undefined : positionLangId,
            shortBio,
            otherMemberName,
            nsPositionsId: currentNationaSectionPosition.id,
            lang: lang.id,
          });
        }
      }

      await tx
        .insert(nationalSectionPositionsLang)
        .values(positionLangs)
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
          `_events.${index}._lang.description`
        ) as string;
        const eventLangId = Number(formData.get(`_events.${index}._lang.id`));
        const fromDate = formData.get(
          `_events.${index}._rangeDate.from`
        ) as string;
        const toDate = formData.get(`_events.${index}._rangeDate.to`) as string;

        if (fromDate) {
          const [currentOtherEvent] = await tx
            .insert(events)
            .values({
              id: id === 0 ? undefined : id,
              nsId,
              startDate: new Date(fromDate),
              endDate: toDate ? new Date(toDate) : new Date(fromDate),
            })
            .onConflictDoUpdate({
              target: events.id,
              set: buildConflictUpdateColumns(events, ["startDate", "endDate"]),
            })
            .returning({ id: events.id });

          if (currentCountry?.nativeLang?.code === locale) {
            const currentEventLangs = await tx.query.eventsLang.findMany({
              where(fields, { eq }) {
                return eq(fields.eventId, id);
              },
              with: {
                l: true,
              },
            });

            const nameTranslateResults = await getTranslateText(
              name,
              locale as Locale
            );
            const descriptionTranslateResults = await getTranslateText(
              description,
              locale as Locale
            );

            const pickedLocales = pickLocales(locale);

            for await (const _currentLocale of pickedLocales) {
              const newLang = await preparedLanguagesByCode.execute({
                locale: _currentLocale,
              });
              const newName = nameTranslateResults.find(
                (item) => item.locale === _currentLocale
              );

              const newDescription = descriptionTranslateResults.find(
                (item) => item.locale === _currentLocale
              );

              otherEventLangs.push({
                id:
                  currentEventLangs.find(
                    (item) => item.l?.code === _currentLocale
                  )?.id || undefined,
                name: newName?.result,
                description: newDescription?.result,
                eventId: currentOtherEvent.id,
                lang:
                  currentEventLangs.find(
                    (item) => item.l?.code === _currentLocale
                  )?.lang ||
                  newLang?.id ||
                  undefined,
              });
            }

            otherEventLangs.push({
              id: eventLangId === 0 ? undefined : eventLangId,
              name,
              description,
              eventId: currentOtherEvent.id,
              lang: lang.id,
            });
          } else {
            otherEventLangs.push({
              id: eventLangId === 0 ? undefined : eventLangId,
              name,
              description,
              eventId: currentOtherEvent.id,
              lang: lang.id,
            });
          }
        }
      }

      await tx
        .insert(eventsLang)
        .values(otherEventLangs)
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
          formData.get(`_festivals.${index}._lang.id`)
        );
        const ownerId = Number(formData.get(`_festivals.${index}.ownerId`));
        const certificationFile = formData.get(
          `_festivals.${index}.certificationFile`
        ) as File;

        const storageCertificationFileId = await uploadFile(
          certificationFile,
          tx
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
                eq(emailTemplates.tag, "festival-group")
              )
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
          `_groups.${index}.certificationFile`
        ) as File;

        const storageCertificationFileId = await uploadFile(
          certificationFile,
          tx
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
                eq(emailTemplates.tag, "festival-group")
              )
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
        `_festivals.${index}.certificationFile`
      ) as File;

      const storageCertificationFileId = await uploadFile(
        certificationFile,
        tx
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
              eq(emailTemplates.tag, "festival-group")
            )
          );

        const message = replaceTags(emailTemplate.template, {
          name: name,
          // password: password,
          email: user.email,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to"
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
        `_groups.${index}.certificationFile`
      ) as File;

      const storageCertificationFileId = await uploadFile(
        certificationFile,
        tx
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
              eq(emailTemplates.tag, "festival-group")
            )
          );

        const message = replaceTags(emailTemplate.template, {
          name: name,
          // password: password,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to"
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

  const festivalLangs: InsertFestivalLang[] = [];

  const t = await getTranslations("notification");
  const lang = await preparedLanguagesByCode.execute({ locale });
  const currentNationalSection = await db.query.nationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, nsId);
    },
  });
  const currentCountry = await db.query.countries.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, currentNationalSection?.countryId!);
    },
    with: {
      nativeLang: true,
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

      if (currentCountry?.nativeLang?.code === locale) {
        const nameTranslateResults = await getTranslateText(
          name,
          locale as Locale
        );

        const pickedLocales = pickLocales(locale);

        for await (const _currentLocale of pickedLocales) {
          const newLang = await preparedLanguagesByCode.execute({
            locale: _currentLocale,
          });

          const newName = nameTranslateResults.find(
            (item) => item.locale === _currentLocale
          );

          festivalLangs.push({
            festivalId: currentFestival.id,
            name: newName?.result,
            lang: newLang?.id || undefined,
          });
        }

        festivalLangs.push({
          name,
          festivalId: currentFestival.id,
          lang: lang?.id,
        });
      } else {
        festivalLangs.push({
          name,
          festivalId: currentFestival.id,
          lang: lang?.id,
        });
      }

      await tx.insert(festivalsLang).values(festivalLangs);

      if (user.email && !user.isCreationNotified) {
        const currentCountry = await tx.query.countries.findFirst({
          where(fields, { eq }) {
            return eq(fields.id, user.countryId!);
          },
        });

        const countryLang = await tx.query.countriesLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.countryId, currentCountry?.id!),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1)
            );
          },
        });

        const [video] = await tx
          .select()
          .from(videoTutorialLinks)
          .where(
            and(
              eq(videoTutorialLinks.lang, currentCountry?.nativeLang! ?? 1),
              eq(videoTutorialLinks.role, role?.id!)
            )
          );

        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
              eq(emailTemplates.tag, "festival-group")
            )
          );
        const message = replaceTags(emailTemplate.template, {
          name: name,
          password: password,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to"
          )}</a>`,
          email: user.email,
          video: `<a target="_blank" href="${video.link}">Video</a>`,
          nsName: countryLang?.name ?? "",
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

  const groupLangs: InsertGroupLang[] = [];

  const t = await getTranslations("notification");
  const lang = await preparedLanguagesByCode.execute({ locale });
  const currentNationalSection = await db.query.nationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, nsId);
    },
  });
  const currentCountry = await db.query.countries.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, currentNationalSection?.countryId!);
    },
    with: {
      nativeLang: true,
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
            return eq(fields.id, currentNationalSection?.countryId!);
          },
        });

        const countryLang = await tx.query.countriesLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.countryId, currentCountry?.id!),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1)
            );
          },
        });

        const [video] = await tx
          .select()
          .from(videoTutorialLinks)
          .where(
            and(
              eq(videoTutorialLinks.lang, currentCountry?.nativeLang! ?? 1),
              eq(videoTutorialLinks.role, role?.id!)
            )
          );

        const [emailTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.lang, currentCountry?.nativeLang! ?? 1),
              eq(emailTemplates.tag, "festival-group")
            )
          );

        const message = replaceTags(emailTemplate.template, {
          name: name,
          password: password,
          url: `<a target="_blank" href="${process.env.HOSTNAME_URL}/login">${t(
            "email.login_to"
          )}</a>`,
          email: user.email,
          video: `<a target="_blank" href="${video.link}">Video</a>`,
          nsName: countryLang?.name ?? "",
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

      const nameTranslateResults = await getTranslateText(
        name,
        locale as Locale
      );

      const pickedLocales = pickLocales(locale as Locale);

      for await (const _currentLocale of pickedLocales) {
        const newLang = await preparedLanguagesByCode.execute({
          locale: _currentLocale,
        });

        const newName = nameTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        groupLangs.push({
          groupId: currentGroup.id,
          name: newName?.result ?? "",
          lang: newLang?.id || undefined,
        });
      }

      groupLangs.push({
        name,
        groupId: currentGroup.id,
        lang: lang?.id,
      });

      await tx.insert(groupsLang).values(groupLangs);

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
        currentUser?.password!
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
  const description = formData.get("_lang.description") as string;
  const directorName = formData.get("directorName") as string;
  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const translatorLanguages = formData.get("translatorLanguages") as string;
  const peoples = Number(formData.get("peoples"));
  const linkConditions = formData.get("linkConditions") as string;
  const statusId = Number((formData.get("_status") as string) ?? "") || null;
  const otherTranslatorLanguage = formData.get(
    "_lang.otherTranslatorLanguage"
  ) as string;
  const groupCategories = JSON.parse(
    (formData.get("groupCategories") as string) || ""
  ) as string[];

  const socialId = Number(formData.get("socialId"));
  const facebookLink = (formData.get("facebook") as string) || null;
  const instagramLink = (formData.get("instagram") as string) || null;
  const websiteLink = (formData.get("website") as string) || null;
  const youtubeId = (formData.get("youtubeId") as string) || null;

  const currentDateSize = Number(formData.get("_currentDateSize"));
  const nextDateSize = Number(formData.get("_nextDateSize"));

  const transportLocationSize = Number(formData.get("_transportLocationSize"));
  const festivalListSelectedSize = Number(
    formData.get("_festivalListSelectedSize")
  );
  const groupListSelectedSize = Number(formData.get("_groupListSelectedSize"));

  const recognizedSince = formData.get("_recognizedSince") as string;
  const recognizedRange = formData.get("_recognizedRange") as string;
  const typeOfCompensation = formData.get("_typeOfCompensation") as string;
  const financialCompensation = formData.get(
    "_financialCompensation"
  ) as string;
  const inKindCompensation = formData.get("_inKindCompensation") as string;
  const components = JSON.parse(
    (formData.get("_components") as string) || "[]"
  ) as string[];

  const groupRegions = JSON.parse(
    (formData.get("_groupRegions") as string) || "[]"
  ) as string[];

  const cover = formData.get("coverPhoto") as string;
  const coverPhotos = JSON.parse(
    (formData.get("coverPhotosId") as string) || "[]"
  ) as { name: string; url: string }[];

  const logo = formData.get("logo") as string;
  const logoId = Number(formData.get("logoId"));

  const accomodationPhoto = formData.get("_accomodationPhoto") as string;
  const accomodationPhotoId = Number(formData.get("_accomodationPhotoId"));

  const photos = formData.getAll("photos") as string[];
  const stagePhotos = formData.getAll("stagePhotos") as string[];
  const countryId = Number(formData.get("countryId"));

  const currentDates: InsertEvent[] = [];
  const currentTransportLocations: InsertTransportLocations[] = [];
  const currentFestivalToConnected: InsertFestivalToConnected[] = [];
  const currentFestivalToGroups: InsertFestivalToGroups[] = [];
  const currentPhotos: InsertFestivalPhotos[] = [];
  const currentStagePhotos: InsertFestivalStagePhotos[] = [];

  const currentFestivalLangsTranslates: Array<InsertFestivalLang> = [];

  const lang = await preparedLanguagesByCode.execute({ locale });
  const t = await getTranslations("notification");

  await db.transaction(async (tx) => {
    const logoNextId = await uploadFileStreams(logo, tx, "festivals", logoId);

    const accomodationNextId = await uploadFileStreams(
      accomodationPhoto,
      tx,
      "festivals",
      accomodationPhotoId
    );

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
        linkConditions,
        logoId: logoNextId ? logoNextId : undefined,
        accomodationPhotoId: accomodationNextId
          ? accomodationNextId
          : undefined,
        youtubeId,
        slug: slug(name),
        countryId,
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
          "linkConditions",
          "coverId",
          "logoId",
          "youtubeId",
          "accomodationPhotoId",
        ]),
      })
      .returning();

    if (coverPhotos.length) {
      const coverPhotosRemoved = await tx
        .delete(festivalCoverPhotos)
        .where(eq(festivalCoverPhotos.festivalId, currentFestival.id))
        .returning();

      await tx.delete(storages).where(
        inArray(
          storages.id,
          coverPhotosRemoved.map((item) => item.photoId!)
        )
      );

      const coverPhotosInserted = await tx
        .insert(storages)
        .values(
          coverPhotos.map((photo) => ({ url: photo.url, name: photo.name }))
        )
        .returning();

      await tx.insert(festivalCoverPhotos).values(
        coverPhotosInserted.map((item) => ({
          photoId: item.id,
          festivalId: currentFestival.id,
        }))
      );
    }

    const currentCountry = await tx.query.countries.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, currentFestival.countryId!);
      },
      with: {
        nativeLang: true,
      },
    });

    if (currentCountry?.nativeLang?.code === locale) {
      const currentFestivalLangs = await tx.query.festivalsLang.findMany({
        where(fields, { eq }) {
          return eq(fields.festivalId, currentFestival.id!);
        },
        with: {
          l: true,
        },
      });

      const descriptionTranslateResults = await getTranslateText(
        description,
        locale as Locale
      );
      const nameTranslateResults = await getTranslateText(
        name,
        locale as Locale
      );
      const otherTranslatorLanguateTranslateResults = await getTranslateText(
        otherTranslatorLanguage,
        locale as Locale
      );

      const pickedLocales = pickLocales(locale);

      for await (const _currentLocale of pickedLocales) {
        const newLang = await preparedLanguagesByCode.execute({
          locale: _currentLocale,
        });
        const newDescription = descriptionTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        const newName = nameTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        const newOtherTranslator = otherTranslatorLanguateTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        currentFestivalLangsTranslates.push({
          id:
            currentFestivalLangs.find((item) => item.l?.code === _currentLocale)
              ?.id || undefined,
          festivalId: currentFestival.id,
          description: newDescription?.result,
          otherTranslatorLanguage: newOtherTranslator?.result,
          name,
          lang:
            currentFestivalLangs.find((item) => item.l?.code === _currentLocale)
              ?.lang ||
            newLang?.id ||
            undefined,
        });
      }

      currentFestivalLangsTranslates.push({
        id: langId === 0 ? undefined : langId,
        name,
        description,
        otherTranslatorLanguage,
        festivalId: currentFestival.id,
        lang: lang?.id,
      });
    } else {
      currentFestivalLangsTranslates.push({
        id: langId === 0 ? undefined : langId,
        name,
        description,
        otherTranslatorLanguage,
        festivalId: currentFestival.id,
        lang: lang?.id,
      });
    }

    await tx
      .insert(festivalsLang)
      .values(currentFestivalLangsTranslates)
      .onConflictDoUpdate({
        target: festivalsLang.id,
        set: buildConflictUpdateColumns(festivalsLang, [
          "name",
          "description",
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

    if (photos.length) {
      const storagePhotoIds = await tx
        .delete(festivalPhotos)
        .where(eq(festivalPhotos.festivalId, currentFestival.id))
        .returning({ deletedStorageId: festivalPhotos.photoId });

      if (storagePhotoIds.length) {
        const storageUrls = await tx
          .delete(storages)
          .where(
            inArray(
              storages.id,
              storagePhotoIds.map((item) => item.deletedStorageId!)
            )
          )
          .returning({ urlToRemove: storages.url });

        if (storageUrls.length) {
          const remoteUrls = storageUrls
            .filter((item) => {
              return !photos.includes(item.urlToRemove);
            })
            .map((item) => item.urlToRemove!);

          if (remoteUrls.length) {
            await del(remoteUrls);
          }
        }
      }

      for await (const photo of photos) {
        const newStorageId = await uploadFileStreams(photo, tx, "festivals");
        if (newStorageId && currentFestival.id) {
          currentPhotos.push({
            festivalId: currentFestival.id,
            photoId: newStorageId,
          });
        }
      }

      if (currentPhotos.length) {
        await tx.insert(festivalPhotos).values(currentPhotos);
      }
    }

    if (stagePhotos.length) {
      const storagePhotoIds = await tx
        .delete(festivalStagePhotos)
        .where(eq(festivalStagePhotos.festivalId, currentFestival.id))
        .returning({ deletedStorageId: festivalPhotos.photoId });

      if (storagePhotoIds.length) {
        const storageUrls = await tx
          .delete(storages)
          .where(
            inArray(
              storages.id,
              storagePhotoIds.map((item) => item.deletedStorageId!)
            )
          )
          .returning({ urlToRemove: storages.url });

        if (storageUrls.length) {
          const remoteUrls = storageUrls
            .filter((item) => {
              return !stagePhotos.includes(item.urlToRemove);
            })
            .map((item) => item.urlToRemove!);

          if (remoteUrls.length) {
            await del(remoteUrls);
          }
        }
      }

      for await (const photo of stagePhotos) {
        const newStorageId = await uploadFileStreams(photo, tx, "festivals");
        if (newStorageId && currentFestival.id) {
          currentStagePhotos.push({
            festivalId: currentFestival.id,
            photoId: newStorageId,
          });
        }
      }

      if (currentStagePhotos.length) {
        await tx.insert(festivalStagePhotos).values(currentStagePhotos);
      }
    }

    if (statusId) {
      await tx
        .insert(festivalsToStatuses)
        .values({
          festivalId: currentFestival.id,
          statusId: statusId,
          recognizedSince,
          recognizedRange,
          typeOfCompensation,
          financialCompensation,
          inKindCompensation,
        })
        .onConflictDoUpdate({
          target: [
            festivalsToStatuses.festivalId,
            festivalsToStatuses.statusId,
          ],
          set: buildConflictUpdateColumns(festivalsToStatuses, [
            "recognizedRange",
            "recognizedSince",
            "typeOfCompensation",
            "financialCompensation",
            "inKindCompensation",
          ]),
        });

      if (components.length) {
        await tx
          .delete(festivalsToComponents)
          .where(eq(festivalsToComponents.festivalId, currentFestival.id));

        await tx.insert(festivalsToComponents).values(
          components.map((componentId) => ({
            componentId: Number(componentId),
            festivalId: currentFestival.id,
          }))
        );
      }
    }

    if (groupRegions.length) {
      await tx
        .delete(festivalsGroupToRegions)
        .where(eq(festivalsGroupToRegions.festivalId, currentFestival.id));

      await tx.insert(festivalsGroupToRegions).values(
        groupRegions.map((regionId) => ({
          regionId: Number(regionId),
          festivalId: currentFestival.id,
        }))
      );
    }

    if (transportLocationSize === 0) {
      await tx
        .delete(transportLocations)
        .where(eq(transportLocations.festivalId, currentFestival.id));
    }

    if (transportLocationSize > 0) {
      for (let index = 0; index < transportLocationSize; index++) {
        const lat = formData.get(`_transportLocations.${index}.lat`) as string;
        const lng = formData.get(`_transportLocations.${index}.lng`) as string;
        const location = formData.get(
          `_transportLocations.${index}.location`
        ) as string;

        currentTransportLocations.push({
          lat,
          lng,
          location,
          festivalId: currentFestival.id,
        });
      }

      if (currentTransportLocations.length) {
        await tx
          .delete(transportLocations)
          .where(eq(transportLocations.festivalId, currentFestival.id));

        await tx.insert(transportLocations).values(currentTransportLocations);
      }
    }

    if (festivalListSelectedSize > 0) {
      for (let index = 0; index < festivalListSelectedSize; index++) {
        const id = Number(formData.get(`_festivalListSelected.${index}.id`));

        currentFestivalToConnected.push({
          sourceFestivalId: currentFestival.id,
          targetFestivalId: id,
        });
      }

      if (currentFestivalToConnected.length) {
        await tx
          .delete(festivalsToConnected)
          .where(eq(festivalsToConnected.sourceFestivalId, currentFestival.id));

        await tx
          .insert(festivalsToConnected)
          .values(currentFestivalToConnected);
      }
    }

    if (groupListSelectedSize === 0) {
      await tx
        .delete(festivalsToGroups)
        .where(eq(festivalsToGroups.festivalId, currentFestival.id));
    }

    if (groupListSelectedSize > 0) {
      for (let index = 0; index < groupListSelectedSize; index++) {
        const id = Number(formData.get(`_groupListSelected.${index}.id`));

        currentFestivalToGroups.push({
          festivalId: currentFestival.id,
          groupId: id,
        });
      }

      if (currentFestivalToGroups.length) {
        await tx
          .delete(festivalsToGroups)
          .where(eq(festivalsToGroups.festivalId, currentFestival.id));

        await tx.insert(festivalsToGroups).values(currentFestivalToGroups);
      }
    }

    if (currentDateSize > 0) {
      for (let index = 0; index < currentDateSize; index++) {
        const id = Number(formData.get(`_currentDates.${index}._rangeDate.id`));
        const fromDate = formData.get(
          `_currentDates.${index}._rangeDate.from`
        ) as string;
        const toDate = formData.get(
          `_currentDates.${index}._rangeDate.to`
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
          `_nextDates.${index}._rangeDate.from`
        ) as string;
        const toDate = formData.get(
          `_nextDates.${index}._rangeDate.to`
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
        .values(
          currentDates.filter(
            (date, index) =>
              currentDates.findIndex((current, i) => current.id === date.id) ===
              index
          )
        )
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
        }))
      );
    }
  });

  return { success: t("success"), error: null };
}

export async function createGroup(prevState: unknown, formData: FormData) {
  const id = Number(formData.get("_id"));
  const generalDirectorName = formData.get("generalDirectorName") as string;
  const generalDirectorPhoto = formData.get("_generalDirectorPhoto") as File;

  const artisticDirectorName = formData.get("artisticDirectorName") as string;
  const artisticDirectorPhoto = formData.get("_artisticDirectorPhoto") as File;

  const musicalDirectorName = formData.get("musicalDirectorName") as string;
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
    "_lang.generalDirectorProfile"
  ) as string;
  const generalDirectorPhoto = formData.get("_generalDirectorPhoto") as string;
  const generalDirectorPhotoId = Number(
    formData.get("_generalDirectorPhotoId")
  );
  const artisticDirectorName = formData.get("artisticDirectorName") as string;
  const artisticDirectorProfile = formData.get(
    "_lang.artisticDirectorProfile"
  ) as string;
  const artisticDirectorPhoto = formData.get(
    "_artisticDirectorPhoto"
  ) as string;
  const artisticDirectorPhotoId = Number(
    formData.get("_artisticDirectorPhotoId")
  );
  const musicalDirectorName = formData.get("musicalDirectorName") as string;
  const musicalDirectorProfile = formData.get(
    "_lang.musicalDirectorProfile"
  ) as string;
  const musicalDirectorPhoto = formData.get("_musicalDirectorPhoto") as string;
  const musicalDirectorPhotoId = Number(
    formData.get("_musicalDirectorPhotoId")
  );
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

  const linkPortfolio = formData.get("linkPortfolio") as string;

  const subgroupSize = Number(formData.get("_subgroupSize"));
  const repertorySize = Number(formData.get("_repertorySize"));

  const typeGroups = JSON.parse(
    (formData.get("_typeOfGroup") as string) || "[]"
  );
  const groupAge = JSON.parse((formData.get("_groupAge") as string) || "[]");
  const styleGroup = JSON.parse(
    (formData.get("_styleOfGroup") as string) || "[]"
  );

  const cover = formData.get("coverPhoto") as string;
  const coverPhotos = JSON.parse(
    (formData.get("coverPhotosId") as string) || "[]"
  ) as { name: string; url: string }[];

  const logo = formData.get("logo") as string;
  const logoId = Number(formData.get("logoId"));

  const photos = formData.getAll("photos") as string[];

  const location = formData.get("location") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const countryId = Number(formData.get("countryId"));

  const groupCategories = [...typeGroups, ...groupAge, ...styleGroup];

  const currentPhotos: InsertGroupPhotos[] = [];
  const groupLangs: InsertGroupLang[] = [];
  const subgroupLangs: InsertSubGroupLang[] = [];
  const repertoryLangs: InsertRepertoryLang[] = [];

  const lang = await preparedLanguagesByCode.execute({ locale });

  await db.transaction(async (tx) => {
    const generaltDirectorPhotoNextId = await uploadFileStreams(
      generalDirectorPhoto,
      tx,
      "groups",
      generalDirectorPhotoId
    );

    const artisticDirectorPhotoNextId = await uploadFileStreams(
      artisticDirectorPhoto,
      tx,
      "groups",
      artisticDirectorPhotoId
    );

    const musicalDirectorPhotoNextId = await uploadFileStreams(
      musicalDirectorPhoto,
      tx,
      "groups",
      musicalDirectorPhotoId
    );

    const logoNextId = await uploadFileStreams(logo, tx, "groups", logoId);

    const [currentGroup] = await tx
      .insert(groups)
      .values({
        id: id === 0 ? undefined : id,
        generalDirectorName,
        generalDirectorPhotoId: generaltDirectorPhotoNextId
          ? generaltDirectorPhotoNextId
          : undefined,
        artisticDirectorName,
        artisticDirectorPhotoId: artisticDirectorPhotoNextId
          ? artisticDirectorPhotoNextId
          : undefined,
        musicalDirectorName,
        musicalDirectorPhotoId: musicalDirectorPhotoNextId
          ? musicalDirectorPhotoNextId
          : undefined,
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
        linkPortfolio,
        logoId: logoNextId ? logoNextId : undefined,
        location,
        lng,
        lat,
        countryId,
      })
      .onConflictDoUpdate({
        target: groups.id,
        set: buildConflictUpdateColumns(groups, [
          "generalDirectorName",
          "artisticDirectorName",
          "musicalDirectorName",
          "phone",
          "isAbleTravel",
          "isAbleTravelLiveMusic",
          "membersNumber",
          "specificTravelDateFrom",
          "specificTravelDateTo",
          "specificRegion",
          "facebookLink",
          "instagramLink",
          "websiteLink",
          "linkPortfolio",
          "location",
          "lng",
          "lat",
        ]),
      })
      .returning();

    if (coverPhotos.length) {
      const coverPhotosRemoved = await tx
        .delete(groupCoverPhotos)
        .where(eq(groupCoverPhotos.groupId, currentGroup.id))
        .returning();

      await tx.delete(storages).where(
        inArray(
          storages.id,
          coverPhotosRemoved.map((item) => item.photoId!)
        )
      );

      const coverPhotosInserted = await tx
        .insert(storages)
        .values(
          coverPhotos.map((photo) => ({ url: photo.url, name: photo.name }))
        )
        .returning();

      await tx.insert(groupCoverPhotos).values(
        coverPhotosInserted.map((item) => ({
          photoId: item.id,
          groupId: currentGroup.id,
        }))
      );
    }

    const currentCountry = await tx.query.countries.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, currentGroup?.countryId!);
      },
      with: {
        nativeLang: true,
      },
    });

    if (currentCountry?.nativeLang?.code === locale) {
      const currentGroupLangs = await tx.query.groupsLang.findMany({
        where(fields, { eq }) {
          return eq(fields.groupId, currentGroup?.id!);
        },
        with: {
          l: true,
        },
      });

      const descriptionTranslateResults = await getTranslateText(
        description,
        locale as Locale
      );
      const addressTranslateResults = await getTranslateText(
        address,
        locale as Locale
      );
      const generalDirectorProfileTranslateResults = await getTranslateText(
        generalDirectorProfile,
        locale as Locale
      );
      const artisticDirectorProfileTranslateResults = await getTranslateText(
        artisticDirectorProfile,
        locale as Locale
      );
      const musicalDirectorProfileTranslateResults = await getTranslateText(
        musicalDirectorProfile,
        locale as Locale
      );

      const pickedLocales = pickLocales(locale);

      for await (const _currentLocale of pickedLocales) {
        const newLang = await preparedLanguagesByCode.execute({
          locale: _currentLocale,
        });

        const newDescription = descriptionTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        const newAddress = addressTranslateResults.find(
          (item) => item.locale === _currentLocale
        );

        const newGeneralDirectorProfile =
          generalDirectorProfileTranslateResults.find(
            (item) => item.locale === _currentLocale
          );

        const newArtisticDirectorProfile =
          artisticDirectorProfileTranslateResults.find(
            (item) => item.locale === _currentLocale
          );

        const newMusicalDirectorProfile =
          musicalDirectorProfileTranslateResults.find(
            (item) => item.locale === _currentLocale
          );

        groupLangs.push({
          id:
            currentGroupLangs.find((item) => item.l?.code === _currentLocale)
              ?.id || undefined,
          name,
          description: newDescription?.result,
          address: newAddress?.result,
          generalDirectorProfile: newGeneralDirectorProfile?.result,
          artisticDirectorProfile: newArtisticDirectorProfile?.result,
          musicalDirectorProfile: newMusicalDirectorProfile?.result,
          groupId: currentGroup?.id,
          lang:
            currentGroupLangs.find((item) => item.l?.code === _currentLocale)
              ?.lang ||
            newLang?.id ||
            undefined,
        });
      }

      groupLangs.push({
        id: langId === 0 ? undefined : langId,
        name,
        description,
        address,
        generalDirectorProfile,
        artisticDirectorProfile,
        musicalDirectorProfile,
        groupId: currentGroup?.id,
        lang: lang?.id,
      });
    } else {
      groupLangs.push({
        id: langId === 0 ? undefined : langId,
        name,
        description,
        address,
        generalDirectorProfile,
        artisticDirectorProfile,
        musicalDirectorProfile,
        groupId: currentGroup?.id,
        lang: lang?.id,
      });
    }

    await tx
      .insert(groupsLang)
      .values(groupLangs)
      .onConflictDoUpdate({
        target: groupsLang.id,
        set: buildConflictUpdateColumns(groupsLang, [
          "name",
          "generalDirectorProfile",
          "artisticDirectorProfile",
          "musicalDirectorProfile",
          "address",
          "description",
        ]),
      });

    if (photos.length) {
      const storagePhotoIds = await tx
        .delete(groupPhotos)
        .where(eq(groupPhotos.groupId, currentGroup.id))
        .returning({ deletedStorageId: groupPhotos.photoId });

      if (storagePhotoIds.length) {
        const storageUrls = await tx
          .delete(storages)
          .where(
            inArray(
              storages.id,
              storagePhotoIds.map((item) => item.deletedStorageId!)
            )
          )
          .returning({ urlToRemove: storages.url });

        if (storageUrls.length) {
          const remoteUrls = storageUrls
            .filter((item) => {
              return !photos.includes(item.urlToRemove);
            })
            .map((item) => item.urlToRemove!);

          if (remoteUrls.length) {
            await del(remoteUrls);
          }
        }
      }

      for await (const photo of photos) {
        const newStorageId = await uploadFileStreams(photo, tx, "groups");
        if (newStorageId && currentGroup.id) {
          currentPhotos.push({
            groupId: currentGroup.id,
            photoId: newStorageId,
          });
        }
      }

      if (currentPhotos.length) {
        await tx.insert(groupPhotos).values(currentPhotos);
      }
    }

    if (subgroupSize > 0) {
      for (let index = 0; index < subgroupSize; index++) {
        const id = Number(formData.get(`_subgroups.${index}.id`));
        const langId = Number(formData.get(`_subgroups.${index}._lang.id`));
        const name = formData.get(`_subgroups.${index}._lang.name`) as string;
        const membersNumber = Number(
          formData.get(`_subgroups.${index}.membersNumber`) || ""
        );
        const subgroupAge = JSON.parse(
          (formData.get(`_subgroups.${index}._groupAge`) as string) || "[]"
        ) as string[];
        const hasAnotherContact =
          (formData.get(`_subgroups.${index}._hasAnotherContact`) as string) ===
          "on";
        const contactName = formData.get(
          `_subgroups.${index}.contactName`
        ) as string;
        const contactMail = formData.get(
          `_subgroups.${index}.contactMail`
        ) as string;
        const contactPhone = formData.get(
          `_subgroups.${index}.contactPhone`
        ) as string;

        const [currentSubgroup] = await tx
          .insert(subgroups)
          .values({
            id: id === 0 ? undefined : id,
            membersNumber,
            hasAnotherContact,
            contactName,
            contactPhone,
            contactMail,
            groupId: currentGroup.id,
          })
          .onConflictDoUpdate({
            target: subgroups.id,
            set: buildConflictUpdateColumns(subgroups, [
              "membersNumber",
              "hasAnotherContact",
              "contactName",
              "contactMail",
              "contactPhone",
            ]),
          })
          .returning();

        if (currentCountry?.nativeLang?.code === locale) {
          const currentSubgroupLangs = await tx.query.subgroupsLang.findMany({
            where(fields, { eq }) {
              return eq(fields.subgroupId, currentSubgroup.id);
            },
            with: {
              l: true,
            },
          });

          const nameTranslateResults = await getTranslateText(
            name,
            locale as Locale
          );

          const pickedLocales = pickLocales(locale);

          for await (const _currentLocale of pickedLocales) {
            const newLang = await preparedLanguagesByCode.execute({
              locale: _currentLocale,
            });
            const newName = nameTranslateResults.find(
              (item) => item.locale === _currentLocale
            );

            subgroupLangs.push({
              id:
                currentSubgroupLangs.find(
                  (item) => item.l?.code === _currentLocale
                )?.id || undefined,
              name: newName?.result,
              subgroupId: currentSubgroup.id,
              lang:
                currentSubgroupLangs.find(
                  (item) => item.l?.code === _currentLocale
                )?.lang ||
                newLang?.id ||
                undefined,
            });
          }

          subgroupLangs.push({
            id: langId === 0 ? undefined : langId,
            name,
            subgroupId: currentSubgroup.id,
            lang: lang?.id,
          });
        } else {
          subgroupLangs.push({
            id: langId === 0 ? undefined : langId,
            name,
            subgroupId: currentSubgroup.id,
            lang: lang?.id,
          });
        }

        await tx
          .insert(subgroupsLang)
          .values(subgroupLangs)
          .onConflictDoUpdate({
            target: subgroups.id,
            set: buildConflictUpdateColumns(subgroupsLang, ["name"]),
          });

        if (subgroupAge.length) {
          await tx
            .delete(subgroupToCategories)
            .where(eq(subgroupToCategories.subgroupId, currentSubgroup.id));

          await tx.insert(subgroupToCategories).values(
            subgroupAge.map((categoryId) => ({
              categoryId: Number(categoryId),
              subgroupId: currentSubgroup.id,
            }))
          );
        }
      }
    }

    if (repertorySize > 0) {
      for (let index = 0; index < repertorySize; index++) {
        const id = Number(formData.get(`_repertories.${index}.id`));
        const langId = Number(formData.get(`_repertories.${index}._lang.id`));
        const name = formData.get(`_repertories.${index}._lang.name`) as string;
        const description = formData.get(
          `_repertories.${index}._lang.description`
        ) as string;
        const youtubeId = formData.get(
          `_repertories.${index}.youtubeId`
        ) as string;

        const [currentRepertory] = await tx
          .insert(repertories)
          .values({
            id: id === 0 ? undefined : id,
            youtubeId,
            groupId: currentGroup.id,
          })
          .onConflictDoUpdate({
            target: subgroups.id,
            set: buildConflictUpdateColumns(repertories, ["youtubeId"]),
          })
          .returning();

        if (currentCountry?.nativeLang?.code === locale) {
          const currentRepertoryLangs = await tx.query.repertoriesLang.findMany(
            {
              where(fields, { eq }) {
                return eq(fields.repertoryId, currentRepertory.id);
              },
              with: {
                l: true,
              },
            }
          );

          const nameTranslateResults = await getTranslateText(
            name,
            locale as Locale
          );

          const descriptionTranslateResults = await getTranslateText(
            description,
            locale as Locale
          );

          const pickedLocales = pickLocales(locale);

          for await (const _currentLocale of pickedLocales) {
            const newLang = await preparedLanguagesByCode.execute({
              locale: _currentLocale,
            });
            const newName = nameTranslateResults.find(
              (item) => item.locale === _currentLocale
            );
            const newDescription = descriptionTranslateResults.find(
              (item) => item.locale === _currentLocale
            );

            repertoryLangs.push({
              id:
                currentRepertoryLangs.find(
                  (item) => item.l?.code === _currentLocale
                )?.id || undefined,
              name: newName?.result,
              description: newDescription?.result,
              repertoryId: currentRepertory.id,
              lang:
                currentRepertoryLangs.find(
                  (item) => item.l?.code === _currentLocale
                )?.lang ||
                newLang?.id ||
                undefined,
            });
          }

          repertoryLangs.push({
            id: langId === 0 ? undefined : langId,
            name,
            description,
            repertoryId: currentRepertory.id,
            lang: lang?.id,
          });
        } else {
          repertoryLangs.push({
            id: langId === 0 ? undefined : langId,
            name,
            description,
            repertoryId: currentRepertory.id,
            lang: lang?.id,
          });
        }

        await tx
          .insert(repertoriesLang)
          .values(repertoryLangs)
          .onConflictDoUpdate({
            target: subgroups.id,
            set: buildConflictUpdateColumns(repertoriesLang, [
              "name",
              "description",
            ]),
          });
      }
    }

    if (groupCategories.length) {
      await tx
        .delete(groupToCategories)
        .where(eq(groupToCategories.groupId, currentGroup.id));

      await tx.insert(groupToCategories).values(
        groupCategories.map((categoryId) => ({
          categoryId: Number(categoryId),
          groupId: currentGroup.id,
        }))
      );
    }
  });

  return { success: t("success"), error: null };
}

export async function updateFestivalStatus(formData: FormData) {
  const id = Number(formData.get("festivalId"));
  const statusId = Number(formData.get("_status"));
  const t = await getTranslations("notification");

  await db.transaction(async (tx) => {
    await tx
      .update(festivals)
      .set({
        statusId,
      })
      .where(eq(festivals.id, id));
  });

  return { success: t("success"), error: null };
}
