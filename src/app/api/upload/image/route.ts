import { storeFileLocally } from "@/lib/file";
import { del, head, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.formData();
  const customField = request.headers.get("x-custom-field");

  const file = body.getAll(customField!).at(-1) as File;

  const { url } = await put(`media/${file.name}`, file, {
    access: "public",
  });

  const response = new NextResponse(url);

  response.headers.set("Content-Type", "text/plain");

  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const load: string =
    request.nextUrl.searchParams.get("load") ||
    request.nextUrl.searchParams.get("fetch") ||
    "";

  const result = await fetch(load);
  const _head = await head(load);

  const blob = await result.blob();

  const response = new NextResponse(blob);

  response.headers.set("Content-Type", _head.contentType);
  response.headers.set("Content-Disposition", _head.contentDisposition);

  return response;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const data = await request.arrayBuffer();

  const url = Buffer.from(data).toString();

  if (url) {
    await del(url);
  }

  return new NextResponse(null, {
    status: 200,
  });
}
