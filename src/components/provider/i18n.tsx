"use client";

import { getMessageFallback } from "@/i18n/handlers";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { SToaster } from "@/components/ui/sonner";

export default function I18NProvider({
  children,
  messages,
  locale,
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages | undefined;
  locale: string;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={getMessageFallback}
    >
      {children}
      <SToaster />
    </NextIntlClientProvider>
  );
}
