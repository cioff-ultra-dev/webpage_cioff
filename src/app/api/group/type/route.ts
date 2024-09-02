import status from "http-status";
import { createTypeGroup, getAllTypeGroups } from "@/db/queries/groups";
import { insertTypeGroupSchema } from "@/db/schema";

export async function GET(_: Request) {
  const data = await getAllTypeGroups();

  if (data.length < 1) {
    return Response.json([], {
      status: status.NOT_FOUND,
    });
  }

  return Response.json(data, {
    status: status.OK,
  });
}

export async function POST(request: Request) {
  const result = await request.json();
  const parse = insertTypeGroupSchema.safeParse({
    name: result?.name,
    slug: result?.name,
  });

  if (!parse.success) {
    return Response.json(parse.error.format(), {
      status: status.UNPROCESSABLE_ENTITY,
    });
  }

  await createTypeGroup(parse.data);

  return new Response(null, {
    status: status.CREATED,
  });
}
