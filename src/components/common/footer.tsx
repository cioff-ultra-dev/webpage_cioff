import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";

function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-primary py-4 sm:py-8 text-white flex justify-center">
      <div className="grid grid-cols-2 max-md:grid-cols-1 text-roboto w-2/5 max-md:w-full">
        <section className="flex flex-col">
          <p className="text-lg">{t("connect")}</p>
          <p className="text-md my-4">info@cioff.org</p>
          <p>
            CIOFF<span className="text-sm align-top">®</span>
          </p>
          <p>{t("place")}</p>
          <p>{t("address")}</p>
          <p>{t("additional")}</p>
          <p>{t("country")}</p>
        </section>
        <section className="flex justify-end">
          <Link href="mailto:legal@cioff.org">
            <Button className="text-lg hover:text-gray-300">
              {t("become")}
            </Button>
          </Link>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
