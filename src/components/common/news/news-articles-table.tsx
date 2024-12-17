"use client";

import { SelectedSubPage, ArticleBody } from "@/types/article";
import {
  saveArticle,
  deleteArticle,
  publishArticle,
  updateSubPage,
  getAllArticles,
} from "@/lib/articles";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectCountries } from "@/db/schema";
import { useLocale, useTranslations } from "next-intl";

import ConfirmDialog from "./confirmDialog";
import { DialogTrigger } from "@/components/ui/dialog";
import ArticleEditor from "./news-articles-form";
import { Locale } from "@/i18n/config";

type NewsArticlesTableProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role?: {
      id: number;
      name: string;
    } | null;
  };
  articles: Array<SelectedSubPage>;
  countries: SelectCountries[];
  localeId: number;
};

const ArticleTable = ({
  articles,
  onEdit,
  removeArticle,
  changePublishArticleStatus,
}: {
  articles: NewsArticlesTableProps["articles"];
  onEdit: (article: SelectedSubPage) => void;
  removeArticle: (id: number) => void;
  changePublishArticleStatus: (id: number, isPublished: boolean) => void;
}) => {
  const translations = useTranslations("news");
  const locale = useLocale();

  const items = useMemo(
    () =>
      articles.map((article) => (
        <TableRow key={article.id}>
          <TableCell>{article.texts[0]?.title || "No title"}</TableCell>
          <TableCell>
            <span>
              {translations(article.isNews ? "table.news" : "table.subpage")}
            </span>
          </TableCell>
          <TableCell>
            {new Date(article.originalDate).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <span
              className={
                article.published ? "text-green-500" : "text-orange-500"
              }
            >
              {translations(
                article.published
                  ? "table.publishedStatus"
                  : "table.draftStatus"
              )}
            </span>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {translations("table.actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(article)}>
                  {translations("table.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                  <ConfirmDialog
                    buttonMessage={translations("remove.button")}
                    buttonVariant="destructive"
                    message={translations("remove.message", {
                      name: article.texts[0].title ?? "title",
                    })}
                    title={translations("remove.title")}
                    handleClick={() => removeArticle(article.id)}
                  >
                    <DialogTrigger asChild>
                      <button>{translations("table.delete")}</button>
                    </DialogTrigger>
                  </ConfirmDialog>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                  <ConfirmDialog
                    buttonMessage={translations(
                      article.published ? "unpublish.button" : "publish.button"
                    )}
                    buttonVariant={
                      article.published ? "destructive" : "default"
                    }
                    message={translations(
                      article.published
                        ? "unpublish.message"
                        : "publish.message",
                      {
                        name: article.texts[0].title ?? "title",
                      }
                    )}
                    title={translations(
                      article.published ? "unpublish.title" : "publish.title"
                    )}
                    handleClick={() =>
                      changePublishArticleStatus(article.id, !article.published)
                    }
                  >
                    <DialogTrigger asChild>
                      <button>
                        {translations(
                          article.published
                            ? "unpublish.button"
                            : "publish.button"
                        )}
                      </button>
                    </DialogTrigger>
                  </ConfirmDialog>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(article.url, "_blank")}
                >
                  {translations("view")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      articles,
      changePublishArticleStatus,
      onEdit,
      removeArticle,
      translations,
      locale,
    ]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{translations("table.name")}</TableHead>
          <TableHead>{translations("table.type")}</TableHead>
          <TableHead>{translations("table.date")}</TableHead>
          <TableHead>{translations("table.status")}</TableHead>
          <TableHead className="w-[100px]">
            {translations("table.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{items}</TableBody>
    </Table>
  );
};

export default function NewsArticlesTable({
  user,
  articles,
  countries,
  localeId,
}: NewsArticlesTableProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticle, setEditingArticle] = useState<SelectedSubPage | null>(
    null
  );

  const translations = useTranslations("news.table");
  const locale = useLocale();
  const router = useRouter();

  const handleTabChange = useCallback(
    async (value: string) => router.push(`?tab=${value}`),
    [router]
  );

  const handleEdit = (article: SelectedSubPage) => {
    setEditingArticle(article);
  };

  const removeArticle = useCallback(
    async (subPageId: number) => {
      await deleteArticle(subPageId);
      router.refresh();
    },
    [router]
  );

  const changePublishArticleStatus = useCallback(
    async (subPageId: number, isPublished: boolean) => {
      await publishArticle(subPageId, isPublished);
      router.refresh();
    },
    [router]
  );

  const handleSave = useCallback(
    async (content: ArticleBody): Promise<void> => {
      if (editingArticle) {
        await updateSubPage(
          editingArticle.id,
          content,
          user.id,
          locale as Locale
        );
      } else {
        await saveArticle(content, user.id, locale as Locale);
      }
      router.refresh();
    },
    [locale, router, user.id, editingArticle]
  );

  const content = useMemo(() => {
    if (editingArticle || isCreating) {
      return (
        <ArticleEditor
          localeId={localeId}
          initialContent={editingArticle!}
          countries={countries}
          onSave={handleSave}
          onExit={() => {
            setEditingArticle(null);
            setIsCreating(false);
          }}
        />
      );
    }

    return (
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <div className="flex items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">{translations("all")}</TabsTrigger>
            <TabsTrigger value="published">
              {translations("published")}
            </TabsTrigger>
            <TabsTrigger value="draft">{translations("draft")}</TabsTrigger>
          </TabsList>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1"
              onClick={() => setIsCreating(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {translations("addSubpage")}
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{translations("allTitle")}</CardTitle>
              <CardDescription>
                {translations("allDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleTable
                articles={articles}
                onEdit={handleEdit}
                removeArticle={removeArticle}
                changePublishArticleStatus={changePublishArticleStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>{translations("publishedTitle")}</CardTitle>
              <CardDescription>
                {translations("publishedDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleTable
                articles={articles}
                onEdit={handleEdit}
                removeArticle={removeArticle}
                changePublishArticleStatus={changePublishArticleStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>{translations("draftTitle")}</CardTitle>
              <CardDescription>
                {translations("draftDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleTable
                articles={articles}
                onEdit={handleEdit}
                removeArticle={removeArticle}
                changePublishArticleStatus={changePublishArticleStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }, [
    articles,
    changePublishArticleStatus,
    countries,
    editingArticle,
    handleSave,
    handleTabChange,
    isCreating,
    localeId,
    removeArticle,
    translations,
  ]);

  return <div>{content}</div>;
}
