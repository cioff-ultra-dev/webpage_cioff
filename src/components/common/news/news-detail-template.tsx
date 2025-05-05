import React from "react";
import Image from "next/image";

import { Section, SelectedSubPage } from "@/types/article";
import { Header } from "@/components/common/header";
import RenderSections from "@/components/common/news/render-articles";
import Footer from "@/components/common/footer";
import AnnualReport from "@/components/common/news/annual-report";

interface NewsDetailTemplateProps {
  subPage: SelectedSubPage;
  title: string;
  sections: Section[];
}

function NewsDetailTemplate(props: NewsDetailTemplateProps) {
  const { subPage, title, sections } = props;

  return (
    <div>
      <div className="relative h-[90vh] bg-black/10">
        <Header
          text="text-white max-lg:text-black text-roboto text-2xl px-2 py-1 hover:bg-white/40 max-lg:hover:bg-black/20"
          className="absolute left-0 right-0 top-0 max-sm:fixed max-sm:bg-white"
        />
        <div className="absolute w-full h-full">
          {subPage.mainImage ? (
            <Image
              src={subPage.mainImage}
              layout="fill"
              objectFit="cover"
              quality={100}
              alt="main-image"
            />
          ) : (
            <div className="w-full h-full bg-gray-400 flex justify-center items-center">
              Image here
            </div>
          )}
        </div>
      </div>
      <main className="flex flex-col items-center pb-5 min-h-[90vh]">
        <div className="w-full h-full flex flex-col bg-white py-16 justify-center items-center">
          <div className="flex flex-col items-center w-full mb-12">
            {subPage.isNews ? (
              <h3 className="text-gray-500">
                {subPage?.country?.slug?.concat(" - ")}
                {subPage.originalDate
                  .toISOString()
                  .split("T")[0]
                  ?.split("-")
                  .reverse()
                  .join(".")}
              </h3>
            ) : null}
            <h1 className="font-bold mb-12 text-4xl text-secular mx-4 text-center">
              {title}
            </h1>
          </div>
          <div className="h-full bg-white w-full overflow-hidden">
            <RenderSections sections={sections ?? []} />
            <AnnualReport />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NewsDetailTemplate;
