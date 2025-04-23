import { JSX } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ForbiddenContentProps {
  text?: string;
}

export function ForbiddenContent(props: ForbiddenContentProps): JSX.Element {
  const translations = useTranslations("common");

  const { text = translations("forbiddenDescription") } = props;

  return (
    <div className="h-full w-full flex justify-center items-center text-center">
      <p>
        {text}&nbsp;
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
