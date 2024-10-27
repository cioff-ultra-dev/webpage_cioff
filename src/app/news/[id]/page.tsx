import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Linkedin, Twitter } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getArticleById } from "@/lib/articles"
import { format } from "date-fns"
import { Article } from "@/types/article"

export default async function ArticleViewPage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id) as Article | null;
  
  if (!article) {
    return <p>Article not found</p>;
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/news" className="inline-flex items-center text-blue-600 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        BACK
      </Link>

      <h1 className="text-3xl font-bold mb-4">
        {article.title}
      </h1>

      <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-gray-500">
        <span className="flex items-center">
          Created: {format(new Date(article.createdAt), 'dd MMM yyyy').toUpperCase()}
        </span>
        <span className="text-gray-400">•</span>
        <span className="flex items-center">
          Updated: {format(new Date(article.updatedAt), 'dd MMM yyyy').toUpperCase()}
        </span>
      </div>

      {article.sections.map((section, index) => {
        switch (section.type) {
          case 'image':
            return (
              <Image
                key={section.id}
                src={section.content}
                alt="Article image"
                width={800}
                height={400}
                className="rounded-lg mb-6"
              />
            );
          case 'title':
            return (
              <h2 key={section.id} className="text-xl font-semibold mb-4">
                {section.content}
              </h2>
            );
          case 'subtitle':
            return (
              <h3 key={section.id} className="text-lg font-semibold mb-3">
                {section.content}
              </h3>
            );
          case 'paragraph':
            return (
              <div key={section.id} className="space-y-4 mb-8">
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            );
          case 'list':
            return (
              <ul key={section.id} className="list-disc list-inside space-y-2 mb-8">
                {section.content.split('\n').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}

      {/* <div className="flex space-x-4 mb-8">
        <Button variant="outline" size="icon">
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Twitter className="h-4 w-4" />
        </Button>
      </div> */}

      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-500">
          By {article.authorId}
        </span>
      </div>
    </article>
  )
}
