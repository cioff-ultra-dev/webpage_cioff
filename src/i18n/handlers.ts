import { IntlError, IntlErrorCode } from "next-intl";

export function onError(error: IntlError) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected and should only log an error
    console.warn(`[${error.code}] - ${error.message}`);
  } else {
    // Other errors indicate a bug in the app and should be reported
    console.error(`[${error.code}] - ${error.message}`);
  }
}

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
    return error.code + " Dear developer, please fix this message: " + path;
  }
}
