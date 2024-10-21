import { storeFileLocally } from "@/lib/file";
import { head } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.formData();
  const customField = request.headers.get("x-custom-field");

  const file = body.getAll(customField!).at(-1) as File;

  const { path } = await storeFileLocally(file, file.name);

  const response = new NextResponse(path);

  response.headers.set("Content-Type", "text/plain");

  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const load: string = request.nextUrl.searchParams.get("load") || "";

  const result = await fetch(load);
  const _head = await head(load);

  const blob = await result.blob();

  const response = new NextResponse(blob);

  response.headers.set("Content-Type", _head.contentType);
  response.headers.set("Content-Disposition", _head.contentDisposition);

  return response;
}
