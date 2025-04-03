import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import groupBy from "object.groupby";

import { CategoriesType } from "@/db/queries/categories";
import { TreeNode } from "@/types/tree-select";
import { Locale } from "@/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
    }`;
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

/**
 * Stole this from the @radix-ui/primitive
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
}

const FESTIVAL_CATEGORY_MAP = {
  music: "typeOfFestival",
  dance: "typeOfFestival",
  "dance-music": "typeOfFestival",
  "youth-adults": "ageParticipants",
  seniors: "ageParticipants",
  "teenagers-children": "ageParticipants",
  authentic: "styleOfFestival",
  elaborado: "styleOfFestival",
  stylized: "styleOfFestival",
  cioff: "status",
  international: "status",
  "host-families": "typeOfAccomodation",
  "hotel-hostel-campus": "typeOfAccomodation",
  "schools-gym-halls": "typeOfAccomodation",
};

const GROUP_CATEGORY_MAP = {
  music: "groupType",
  dance: "groupType",
  "dance-music": "groupType",
  "youth-adults": "groupAge",
  seniors: "groupAge",
  "teenagers-children": "groupAge",
  authentic: "styleGroup",
  elaborado: "styleGroup",
  stylized: "styleGroup",
};

export function groupCategories(categories: CategoriesType, categoryType: "groups" | "festivals", locale: Locale, t: (key: string) => string): TreeNode[] {
  const groupedItems = groupBy(categories ?? [], (item) =>
    categoryType === "groups"
      ? GROUP_CATEGORY_MAP[item.slug as keyof typeof GROUP_CATEGORY_MAP]
      : FESTIVAL_CATEGORY_MAP[item.slug as keyof typeof FESTIVAL_CATEGORY_MAP]
  );

  delete groupedItems.undefined;
  // categoryType === "festivals" && categories.some((cat) => cat.slug === "mixed") &&
  //   groupedItems["styleOfFestival"]?.push(
  //     categories.find((cat) => cat.slug === "mixed")!
  //   );

  return Object.keys(groupedItems).map((key, index) => {
    const categories = groupedItems[key];

    return {
      label: t(`form.festival.tag.${key}`),
      value: key,
      children: categories?.length
        ? categories.map((cat) => ({
          label:
            cat?.langs?.find((lang) => lang?.l?.code === locale)?.name ??
            cat?.slug,
          value: cat?.id?.toString() ?? index,
        }))
        : undefined,
    };
  }) as TreeNode[]
}