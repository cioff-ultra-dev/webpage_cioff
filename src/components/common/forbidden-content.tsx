import { JSX } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function ForbiddenContent(): JSX.Element {
  const translations = useTranslations("common");

  return (
    <div className="h-full w-full flex justify-center items-center text-center">
      <p>
        {translations("forbiddenDescription")}&nbsp;
        <Link
          href="/login"
          className="text-primary font-semibold cursor-pointer hover:underline"
        >
          {translations("signIn")}
        </Link>
      </p>
    </div>
  );
}

export default ForbiddenContent;
