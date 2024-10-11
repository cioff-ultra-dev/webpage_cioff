import { db } from "@/db";
import {
  categoryGroups,
  emailTemplates,
  owners,
  roles,
  users,
  videoTutorialLinks,
} from "@/db/schema";
import { transport } from "@/lib/mailer";
import replaceTags from "@codejamboree/replace-tags";
import { eq, and } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import generator from "generate-password-ts";
import { NextRequest } from "next/server";
import { generateHashPassword } from "@/lib/password";

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

  const checkEmail = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (checkEmail) {
    return Response.json({ error: t("email_exist") });
  }

  try {
    await db.transaction(async (tx) => {
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
      const password = generator.generate({ length: 10, numbers: true });
      const hashedPassword = await generateHashPassword(password);

      const [user] = await tx
        .insert(users)
        .values({
          email,
          roleId: role?.id || null,
          countryId: countryId,
          password: hashedPassword,
        })
        .returning();

      if (festivalId) {
        const data = await db.query.festivalsLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.festivalId, festivalId),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        name = data?.name ?? "";
        await tx
          .update(owners)
          .set({
            userId: user.id,
          })
          .where(eq(owners.festivalId, festivalId));
      }

      if (groupId) {
        const data = await db.query.groupsLang.findFirst({
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.groupId, groupId),
              operators.eq(fields.lang, currentCountry?.nativeLang ?? 1),
            );
          },
        });

        name = data?.name ?? "";
        await tx
          .update(owners)
          .set({
            userId: user.id,
          })
          .where(eq(owners.groupId, groupId));
      }

      if (user.email && !user.isCreationNotified) {
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
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Something went wrong" });
  }

  return Response.json({ success: t("sent_success") });
}
