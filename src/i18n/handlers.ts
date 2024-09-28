import { IntlError, IntlErrorCode } from "next-intl";

export function getMessageFallback({
  namespace,
  key,
  error,
}: {
  namespace?: string;
  key: string;
  error: IntlError;
}): string {
  const path = [namespace, key].filter((part) => part != null).join(".");

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return key;
  } else {
    return "Dear developer, please fix this message: " + path;
  }
}
