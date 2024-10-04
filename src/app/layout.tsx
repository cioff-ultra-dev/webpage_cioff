import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { cn } from "@/lib/utils";
import "./globals.css";
import I18NProvider from "@/components/provider/i18n";

const fontHeading = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CIOFF Website",
  description: "Small description for the CIOFF site",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn("antialiased", fontHeading.variable, fontBody.variable)}
      >
        <I18NProvider messages={messages} locale={locale}>
          {children}
        </I18NProvider>
      </body>
    </html>
  );
}
