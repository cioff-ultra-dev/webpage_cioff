import constants from "@/constants";
import { Locale, pickLocales } from "@/i18n/config";
import { v2 } from "@google-cloud/translate";

const projectId = constants.google.apiKey;

const _client = new v2.Translate({ projectId, key: projectId });

export async function getTranslateText(text: string, currentLocale: Locale) {
  const results: Array<{ result: string; locale: Locale }> = [];

  const pickedLocales = pickLocales(currentLocale);

  for await (const nextLocale of pickedLocales) {
    if (!text) {
      results.push({
        result: "",
        locale: nextLocale,
      });
      continue;
    }
    const [result] = await _client.translate(text, nextLocale);

    results.push({
      result,
      locale: nextLocale,
    });
  }

  return results;
}
