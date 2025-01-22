import { NextResponse } from "next/server";

import { transport } from "@/lib/mailer";
import { State } from "@/types/send-email";
import { getEmailsFromOwners } from "@/db/queries/owners";
import { db } from "@/db";
import { announcements, announcementsFiles } from "@/db/schema";
import { uploadFile } from "@/app/actions";
import { auth } from "@/auth";

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) chunks.push(value);
    done = readerDone;
  }

  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const session = await auth();
  const formData = await request.formData();

  const toRaw = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const content = formData.get("content") as string;
  const attachments = formData.getAll("attachments") as File[];

  if (!toRaw || !subject || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  let to: string[] = ["faguzman.97@gmail.com"];
  try {
    const tabs = JSON.parse(toRaw) as State;

    const emails = await getEmailsFromOwners({
      festivalsId: tabs.festivals,
      groupsId: tabs.groups,
      nationalSectionsId: tabs.nationalSections,
    });

    if (emails.length > 0) to.push(...emails.filter((email) => !!email));

    if (tabs.users.length > 0) to.push(...tabs.users);

    if (!Array.isArray(to) || to.some((email) => typeof email !== "string")) {
      throw new Error("Invalid email list format");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid format for recipient emails" },
      { status: 400 }
    );
  }

  try {
    const formattedAttachments = await Promise.all(
      attachments.map(async (file) => ({
        filename: file.name,
        content: await streamToBuffer(file.stream()),
      }))
    );

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: content,
      html: `<p>${content}</p>`,
      attachments: formattedAttachments,
    };

    await transport.sendMail(mailOptions);

    await db.transaction(async (trx) => {
      const filesId = await Promise.all(
        attachments.map(async (attachment) => uploadFile(attachment, trx))
      );

      const [announcementRecord] = await trx
        .insert(announcements)
        .values({
          from: process.env.GMAIL_USER!,
          to: to.join(","),
          subject,
          description: content,
          createdBy: session?.user.id ?? "",
        })
        .returning();

      await filesId.reduce(async (acc, item) => {
        await acc;

        await trx
          .insert(announcementsFiles)
          .values({ announcementId: announcementRecord.id, mediaId: item });
      }, Promise.resolve());
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
