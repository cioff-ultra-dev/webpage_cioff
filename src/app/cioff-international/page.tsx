import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import Banner from "@/components/common/banner";
import { ImpactSection } from "@/components/common/impact/impact-section";
import AnnualReport from "@/components/common/news/annual-report";
import CarouselHistory from "@/components/common/carousel-history";
import { Header } from "@/components/common/header";
import Footer from "@/components/common/footer";
import CouncilSection from "@/components/common/council/council-section";

function International() {
  const translations = useTranslations("internationalPage");

  return (
    <div>
      <div className="relative h-[90vh] bg-black/10">
        <Header
          text="text-white max-lg:text-black text-roboto text-2xl px-2 py-1 hover:bg-white/40 max-lg:hover:bg-black/20"
          className="absolute left-0 right-0 top-0 max-sm:fixed max-sm:bg-white"
        />
        <div className="absolute w-full h-full">
          <Image
            src="/cover-international.jpg"
            layout="fill"
            objectFit="cover"
            quality={100}
            alt="main-image"
          />
        </div>
      </div>
      <main className="flex flex-col items-center pb-5 min-h-[90vh]">
        <Banner
          containerClass="my-36"
          image="/international-banner-1.jpg"
          title="CIOFF®"
          description={translations("bannerDescription1")}
        />
        <Banner
          containerClass="mb-36 "
          image="/international-banner-2.jpg"
          title={translations("bannerTitle2")}
          description={translations("bannerDescription2")}
          justify="right"
        />
        <h2 className="font-bold text-5xl text-center mb-16 font-secular max-md:text-3xl">
          {translations("council")}
        </h2>
        <CouncilSection />
        <Banner
          containerClass="my-36"
          image="/international-banner-3.jpg"
          title={translations("bannerTitle3")}
          description={translations("bannerDescription3")}
        />
        {/* <h2 className="font-bold text-5xl text-center mb-16 font-secular max-md:text-3xl">
          {translations("chart")}
        </h2>
        <div className="relative h-[650px] w-full mt-16 flex justify-center max-md:!h-[450px]">
          <Image
            src="/organization-chart.png"
            alt="organization-chart"
            fill
            className="!relative !w-[50vw] max-lg:!w-[80vw]"
          />
        </div> */}
        <Banner
          containerClass="mb-36"
          image="/international-banner-4.jpg"
          title={translations("bannerTitle4")}
          description={translations("bannerDescription4")}
          justify="right"
        />
        {/* <ImpactSection hideButton />
        <h2 className="font-bold text-3xl text-center mt-24 font-secular max-md:text-3xl">
          CIOFF<span className="align-top text-lg">®</span>{" "}
          {translations("reports")}
        </h2>
        <div className="my-16 w-full h-auto">
          <AnnualReport validatePath={false} />
        </div>
        <Banner
          containerClass="my-36"
          image="/international-banner-5.jpg"
          title={translations("bannerTitle5")}
          description={translations("bannerDescription5")}
        />
        <section className="flex flex-col items-center">
          <h2 className="font-bold text-3xl text-center font-secular max-md:text-3xl">
            {translations("history")}
          </h2>
          <CarouselHistory containerClass="my-8 relative w-[90vw]" />
        </section> */}
      </main>
      <Footer />
    </div>
  );
}

export default International;
