import type { Metadata } from "next";
import { Inter, Rouge_Script, Secular_One, Roboto_Condensed } from "next/font/google";
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

const fontBanner = Rouge_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: "400",
});

const fontSecular = Secular_One({
  subsets: ["latin"],
  variable: "--font-secular",
  weight: "400",
});

const fontRoboto = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "700", "900", "100", "300","500","600","800"],
})

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
        className={cn(
          "antialiased",
          fontHeading.variable,
          fontBody.variable,
          fontBanner.variable,
          fontSecular.variable,
          fontRoboto.variable
        )}
      >
        <I18NProvider messages={messages} locale={locale}>
          {children}
        </I18NProvider>
      </body>
    </html>
  );
}
