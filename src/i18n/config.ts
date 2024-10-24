export type Locale = (typeof locales)[number];

export const locales = ["en", "es", "fr"] as const;
export const defaultLocale: Locale = "en";

export const pickLocales: (currentLocale: Locale) => Locale[] = (
  currentLocale: Locale,
) => locales.filter((item) => item !== currentLocale);
