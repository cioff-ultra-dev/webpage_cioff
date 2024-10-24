import { db } from "@/db";
import {
  emailTemplates,
  festivals,
  owners,
  roles,
  users,
  videoTutorialLinks,
} from "@/db/schema";
import { transport } from "@/lib/mailer";
import replaceTags from "@codejamboree/replace-tags";
import { eq, and, getTableColumns, sql, SQL } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import generator from "generate-password-ts";
import { NextRequest } from "next/server";
import { generateHashPassword } from "@/lib/password";
import { PgTable } from "drizzle-orm/pg-core";

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

export async function GET(request: NextRequest) {
  const t = await getTranslations("notification");
  const email: string = request.nextUrl.searchParams.get("email") || "";
  const festivalId: number = Number(
    request.nextUrl.searchParams.get("festivalId") || "",
  );
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "",
  );

  const groupId: number = Number(
    request.nextUrl.searchParams.get("groupId") || "",
  );
  const roleName: string = request.nextUrl.searchParams.get("roleName") || "";
  const userId: string | undefined =
    request.nextUrl.searchParams.get("userId") || undefined;
  const ownerId: number = Number(
    request.nextUrl.searchParams.get("ownerId") || "",
  );
  const nsId: number = Number(request.nextUrl.searchParams.get("nsId") || "");

  const checkEmail = await db.query.users.findFirst({
    where(fields, { eq, ne, and }) {
      if (userId) {
        return and(eq(fields.email, email), ne(fields.id, userId));
      }

      return eq(fields.email, email);
    },
  });

  if (checkEmail) {
    return Response.json({ error: t("email_exist") });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const role = await tx.query.roles.findFirst({
        where: eq(roles.name, roleName),
      });

      const currentCountry = await tx.query.countries.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, countryId);
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

      let name = "";
      let nsName = "";
      const password = generator.generate({ length: 10, numbers: true });
      const hashedPassword = await generateHashPassword(password);

      const [user] = await tx
        .insert(users)
        .values({
          id: userId ? userId : undefined,
          email,
          roleId: role?.id || null,
          countryId: countryId,
          password: hashedPassword,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: buildConflictUpdateColumns(users, ["email", "password"]),
          setWhere: eq(users.active, false),
        })
        .returning({
          id: users.id,
          email: users.email,
          isActive: users.active,
        });

      if (!user) {
        return { warning: t("user_already_actived") };
      }

      if (nsId) {
        const countryLang = await tx.query.countriesLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.countryId, currentCountry?.id!),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        nsName = countryLang?.name ?? "";
      }

      if (festivalId) {
        const data = await tx.query.festivalsLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.festivalId, festivalId),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        await tx
          .update(festivals)
          .set({ email: user.email })
          .where(eq(festivals.id, festivalId));

        name = data?.name ?? "";

        await tx
          .insert(owners)
          .values({
            id: ownerId ? ownerId : undefined,
            userId: user.id,
            festivalId,
          })
          .onConflictDoUpdate({
            target: owners.id,
            set: buildConflictUpdateColumns(owners, ["userId"]),
            setWhere: eq(owners.festivalId, festivalId),
          });
      }

      if (groupId) {
        const data = await tx.query.groupsLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.groupId, groupId),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        name = data?.name ?? "";

        await tx
          .insert(owners)
          .values({
            id: ownerId ? ownerId : undefined,
            userId: user.id,
            groupId,
          })
          .onConflictDoUpdate({
            target: owners.id,
            set: buildConflictUpdateColumns(owners, ["userId"]),
            setWhere: eq(owners.groupId, groupId),
          });
      }

      if (user.email && !user.isActive) {
        const [emailTemplate] = await tx
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
          nsName: nsName,
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

      return { success: t("sent_success") };
    });

    return Response.json(result);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Something went wrong" });
  }
}
