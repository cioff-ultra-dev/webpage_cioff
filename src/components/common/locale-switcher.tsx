"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LanguagesType } from "@/db/queries/languages";
import { defaultLocale, Locale } from "@/i18n/config";
import { setUserLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function LocaleSwitcher({
  locales,
  className,
}: {
  locales: LanguagesType;
  defaultLocale?: string;
  className?: string;
}) {
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("locale_switch");

  const handleLocaleChange = (value: string) => {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  return (
    <Select
      onValueChange={handleLocaleChange}
      disabled={isPending}
      defaultValue={currentLocale || defaultLocale}
    >
      <SelectTrigger className="w-fit">
        <SelectValue placeholder="Select your current locale" />
      </SelectTrigger>
      <SelectContent className="min-w-fit">
        {locales.map((locale) => (
          <SelectItem
            key={locale.code}
            value={locale.code}
            className="flex gap-1 w-20 pl-0 py-2 justify-center"
          >
            <span
              className="text-base text-center uppercase"
              role="presentation"
              aria-label={`Flag for ${locale.name}`}
            >
              {locale.code}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "text-white",
            isPending && "pointer-events-none opacity-60",
            className,
          )}
          size="icon"
          title={t("select")}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={cn(
              "flex cursor-pointer items-center gap-2",
              locale.code === currentLocale && "bg-gray-100",
            )}
          >
            <span
              className="text-base uppercase"
              role="img"
              aria-label={`Flag for ${locale.name}`}
            >
              {locale.code}
            </span>
            {t(locale.code)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
