import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BannerContent } from "@/types/article";

interface VariantSelectorProps {
  value: string;
  callback: (key: keyof BannerContent, value: string) => void;
}

export function JustifyBannerSelector({ value, callback }: VariantSelectorProps) {
  const locale = useLocale();
  const translations = useTranslations("news.form.sections");

  const items = useMemo(() => {
    return [
      "center",
      "left",
      "right",
    ].map((variant, i) => (
      <SelectItem key={i} value={variant} className="flex gap-1">
        {translations(variant)}
      </SelectItem>
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translations, locale]);

  return (
    <Select
      onValueChange={(value: string) => callback("justify", value)}
      value={value}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={translations("justifyPlaceholder")} />
      </SelectTrigger>
      <SelectContent>{items}</SelectContent>
    </Select>
  );
}
