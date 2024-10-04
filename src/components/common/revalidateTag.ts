"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export const customRevalidateTag = async (tag: string) => {
  revalidateTag(tag);
};

export const customRevalidatePath = async (tag: string) => {
  revalidatePath(tag);
};
