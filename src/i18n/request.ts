import { getUserLocale } from "@/lib/locale";
import { IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import deepmerge from "deepmerge";
import { defaultLocale } from "./config";
import { getMessageFallback, onError } from "./handlers";

// @ts-expect-error
export default getRequestConfig(async () => {
  const locale = (await getUserLocale()) || defaultLocale;
  const currentMessages = (await import(`../../messages/${locale}.json`))
    .default;
  const currentZodMessages = (await import(`../../messages/zod/${locale}.json`))
    .default;
  const defaultMessages = (await import("../../messages/en.json")).default;
  const defaultZodMessages = (await import("../../messages/zod/en.json"))
    .default;
  const messages = deepmerge(defaultMessages, currentMessages);
  const zodMessages = deepmerge(defaultZodMessages, currentZodMessages);

  return {
    locale,
    messages: { ...messages, ...zodMessages },
    getMessageFallback,
    onError,
  };
});
