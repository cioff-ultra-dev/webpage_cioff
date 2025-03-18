import LatestNews from "@/components/common/news/latest-news";
import { Header } from "@/components/common/header";

export default async function NewsPage() {
  return (
    <div>
      <Header
        text="text-white max-lg:text-black text-roboto text-2xl px-2 py-1 hover:bg-white/40 max-lg:hover:bg-black/20"
        className="absolute left-0 right-0 top-0"
      />
      <main className="bg-gray-50">
        <LatestNews classes="min-h-screen" />
      </main>
    </div>
  );
}
