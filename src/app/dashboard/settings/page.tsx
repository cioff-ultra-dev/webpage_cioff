import Link from "next/link";
import { addMonths, isAfter } from "date-fns";
import { getTranslations } from "next-intl/server";

import SettingProfile from "@/components/common/settings/profile";
import { auth } from "@/auth";
import { db } from "@/db";

export default async function DashboardPage() {
  const [session, translations] = await Promise.all([
    auth(),
    getTranslations("form.profile"),
  ]);

  const currentInfo = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, session?.user.id!);
    },
  });

  const sixMonthsLater = addMonths(currentInfo?.updatedAt ?? new Date(), 6);

  const passwordIsExpired = isAfter(new Date(), sixMonthsLater);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">{translations("settings")}</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link href="#" className="font-semibold text-primary">
              {translations("profile")}
            </Link>
            {/* <Link href="#">Security</Link> */}
            {/* <Link href="#">Integrations</Link> */}
            {/* <Link href="#">Support</Link> */}
            {/* <Link href="#">Organizations</Link> */}
            {/* <Link href="#">Advanced</Link> */}
          </nav>
          <div className="grid gap-6">
            {passwordIsExpired && (
              <div id="password-expired" className="rounded-lg border-2 p-3 text-sm text-red-800 bg-red-200 border-red-400 text-center">
                <h2 className="font-semibold text-lg">
                  {translations("passwordExpired")}
                </h2>
                <p className="mt-3 mb-5 text-base">
                  {translations("passwordExpiredDescription")}
                </p>
                <p className="text-start text-sm">
                  {translations.rich("passwordExpiredNote", {
                    strong: (chunks) => (
                      <span className="font-semibold">{chunks}</span>
                    ),
                  })}
                </p>
              </div>
            )}
            <SettingProfile session={session!} currentInfo={currentInfo!} />
          </div>
        </div>
      </main>
    </div>
  );
}
