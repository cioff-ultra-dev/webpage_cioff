"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LanguagesType } from "@/db/queries/languages";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

const flags = {
  es: "🇪🇸",
  en: "🇬🇧",
  fr: "🇫🇷",
} as const;

export default function LocaleSwitcher({
  locales,
  className,
}: {
  locales: LanguagesType;
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "text-white",
            isPending && "pointer-events-none opacity-60",
            className
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
              locale.code === currentLocale && "bg-gray-100"
            )}
          >
            <span
              className="text-base"
              role="img"
              aria-label={`Flag for ${locale.name}`}
            >
              {flags[locale.code]}
            </span>
            {t(locale.code)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}