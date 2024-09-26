import { z } from "zod";
import { useTranslations } from "next-intl";
import { makeZodI18nMap } from "@/lib/zod-error-map";

export const useI18nZodErrors = (keyForm?: string) => {
  const t = useTranslations("zod");
  const tForm = useTranslations(`form${keyForm ? `.${keyForm}` : ""}`);
  const tCustom = useTranslations("customErrors");
  const errorMap = makeZodI18nMap({ t, tForm, tCustom });
  z.setErrorMap(errorMap);
};
