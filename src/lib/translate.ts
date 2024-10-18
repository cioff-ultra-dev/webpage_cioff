import { Locale } from "@/i18n/config";
import { v2 } from "@google-cloud/translate";

const projectId = "AIzaSyBZWUFzd-rENmripV3Y67g6xKZ3Dqo2LQw";

const _client = new v2.Translate({ projectId, key: projectId });

export async function getTranslateText(text: string, locale: Locale) {
  const [response] = await _client.translate(text, locale);

  return response;
}
