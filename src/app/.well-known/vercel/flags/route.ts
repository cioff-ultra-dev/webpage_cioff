import { NextResponse, type NextRequest } from "next/server";
import { verifyAccess, type ApiData } from "@vercel/flags";

export async function GET(request: NextRequest) {
  const access = await verifyAccess(request.headers.get("Authorization"));
  if (!access) return NextResponse.json(null, { status: 401 });

  return NextResponse.json<ApiData>({
    definitions: {
      homepage: {
        description:
          "Controls whether the  show homepage without any protection is visible",
        origin: "https://example.com/#new-feature",
        options: [
          { value: false, label: "Off" },
          { value: true, label: "On" },
        ],
      },
    },
  });
}
