import React from "react";
import Image from "next/image";

import { Section, SelectedSubPage } from "@/types/article";
import { Header } from "@/components/common/header";
import RenderSections from "@/components/common/news/render-articles";
import Footer from "@/components/common/footer";

interface NewsDetailTemplateProps {
  subPage: SelectedSubPage;
  title: string;
  sections: Section[];
}

function NewsDetailTemplate(props: NewsDetailTemplateProps) {
  const { subPage, title, sections } = props;

  return (
    <div>
      <Header text="text-black" className="border-b" />
      <main className="flex flex-col items-center pb-5 min-h-[90vh]">
        <div className="w-full h-full flex flex-col bg-white py-16 justify-center items-center">
          <div className="flex flex-col items-center w-full mb-12">
            {subPage.isNews ? (
              <h3 className="text-gray-500">
                {subPage.country.slug} -{" "}
                {subPage.originalDate
                  .toISOString()
                  .split("T")[0]
                  ?.split("-")
                  .reverse()
                  .join(".")}
              </h3>
            ) : null}
            <h1 className="font-bold mb-12 text-2xl">{title}</h1>
            <div
              style={{ position: "relative", width: "100%", height: "40rem" }}
            >
              {subPage.mainImage ? (
                <Image
                  src={subPage.mainImage}
                  layout="fill"
                  objectFit="cover"
                  quality={100}
                  alt="main-image"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex justify-center items-center">
                  Image here
                </div>
              )}
            </div>
          </div>
          <div className="container h-full bg-white">
            <RenderSections sections={sections ?? []} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NewsDetailTemplate;
