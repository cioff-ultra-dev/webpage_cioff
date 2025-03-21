import { JSX, ReactElement } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { ImpactItem } from "./impact-item";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ImpactSection(): JSX.Element {
    const translations = useTranslations("impact");

    return (
        <section className="w-full flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-16 text-center text-roboto uppercase mt-6">
                {translations("impactTitle")}
            </h2>
            <div className="w-full grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-lg:px-40 gap-y-10 gap-x-6 px-60 max-md:px-32 max-sm:px-20">
                <ImpactItem altImage="volunteers" image="/volunteers.png" description={translations("volunteers")} />
                <ImpactItem altImage="countries" image="/countries.png" description={translations("countries")} />
                <ImpactItem altImage="artists" image="/artists.png" description={translations("artists")} />
                <ImpactItem altImage="festivals" image="/festivals.png" description={translations("festivals")} />
                <ImpactItem altImage="groups" image="/groups.png" description={translations("groups")} />
                <ImpactItem altImage="age" image="/age.png" description={translations("age")} />
                <ImpactItem altImage="experience" image="/experience.png" description={translations("experience")} />
                <ImpactItem altImage="unesco" image="/unesco.png" description={translations("unesco")} />
                <ImpactItem altImage="children" image="/children.png" description={translations("children")} />
            </div>
            <Button
                size="sm"
                className="rounded-xl text-roboto font-semibold text-sm px-4 text-white hover:bg-white hover:text-primary hover:border hover:border-primary mt-8 mb-16 capitalize"
            >
                <Link href="/about-us">{translations("more")}</Link>
            </Button>
        </section>
    );
}