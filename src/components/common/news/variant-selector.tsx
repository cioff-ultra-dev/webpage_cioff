import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonContent } from "@/types/article";

interface VariantSelectorProps {
  buttonInfo: ButtonContent;
  callback: (key: keyof ButtonContent, value: string) => void;
}

function VariantSelector({ buttonInfo, callback }: VariantSelectorProps) {
  const locale = useLocale();
  const translations = useTranslations("news.form");

  const items = useMemo(() => {
    return [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ].map((variant, i) => (
      <SelectItem key={i} value={variant} className="flex gap-1">
        {translations(variant)}
      </SelectItem>
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translations, locale]);

  return (
    <Select
      onValueChange={(value: string) => callback("variant", value)}
      value={buttonInfo.variant}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={translations("variantPlaceholder")} />
      </SelectTrigger>
      <SelectContent>{items}</SelectContent>
    </Select>
  );
}

export default VariantSelector;
