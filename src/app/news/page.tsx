import Image from "next/image";

import LatestNews from "@/components/common/news/latest-news";
import { Header } from "@/components/common/header";
import Footer from "@/components/common/footer";

export default async function NewsPage() {
  return (
    <div>
      <div className="relative h-[90vh] bg-black/10">
        <Header
          text="text-white max-lg:text-black text-roboto text-2xl px-2 py-1 hover:bg-white/40 max-lg:hover:bg-black/20"
          className="absolute left-0 right-0 top-0 max-sm:fixed max-sm:bg-white"
        />
        <div className="absolute w-full h-full">
          <Image
            src="/default-cover-photo.jpg"
            layout="fill"
            objectFit="cover"
            quality={100}
            alt="main-image"
          />
        </div>
      </div>
      <main className="bg-gray-50">
        <LatestNews
          classes="min-h-screen max-sm:px-10 max-md:px-16 max-lg:px-24 px-28"
          resultClasses="max-sm:columns-1 max-md:columns-2"
        />
      </main>
      <Footer />
    </div>
  );
}
