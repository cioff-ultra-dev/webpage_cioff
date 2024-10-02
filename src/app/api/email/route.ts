import { db } from "@/db";
import { emailTemplates } from "@/db/schema";
import { transport } from "@/lib/mailer";
import { eq, sql } from "drizzle-orm";
import { replaceTags } from "@codejamboree/replace-tags";

const preparedLanguagesByCode = db.query.languages
  .findFirst({
    where: (languages, { eq }) => eq(languages.code, sql.placeholder("locale")),
  })
  .prepare("query_language_by_code");

export async function GET(_: Request) {
  const info = { hola: "hello" };
  const locale = "en";

  const lang = await preparedLanguagesByCode.execute({ locale });

  const [result] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.lang, lang?.id!));

  const message = replaceTags(result.template, {
    name: "hola",
    password: "__hola",
    url: `<a href="#">Login on CIOFF</a>`,
  });
  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to: ["celb25@gmail.com"],
    subject: `[REQUEST] - Verification your festival called`,
    html: message,
  });

  return Response.json({ message });
}
