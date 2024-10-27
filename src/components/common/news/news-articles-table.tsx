'use client'
import { Article, Section } from '@/types/article';
import { saveArticle } from '@/lib/articles';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import ArticleEditor from './news-articles-form';

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
  articles: Array<{
    id: number;
    slug: string;
    originalDate: Date;
    texts: Array<{
      title: string;
      description: string;
      sections?: string;
    }>;
  }>;
};

const ArticleTable = ({ articles, onEdit }: { articles: NewsArticlesTableProps['articles'], onEdit: (id: string) => void }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {articles.map((article) => (
        <TableRow key={article.id}>
          <TableCell>{article.texts[0]?.title || 'No title'}</TableCell>
          <TableCell>{new Date(article.originalDate).toLocaleDateString()}</TableCell>
          <TableCell>{article.texts[0]?.description || 'No description'}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(article.id.toString())}>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem>Post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function NewsArticlesTable({ user, articles }: NewsArticlesTableProps) {
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const router = useRouter();

  const handleEdit = (id: string) => {
    setEditingArticle(id);
  };

  const handleSave = async (content: { title: string; description: string; sections: Section[] }) => {
    try {
      await saveArticle(content, user.id);
      setNotification({ type: 'success', message: 'Article saved successfully' });
      setTimeout(() => {
        router.push('/dashboard/news');
      }, 2000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save article: ' + (error as Error).message });
    }
  };

  const renderContent = () => {
    if (editingArticle || isCreating) {
      return <ArticleEditor
        initialContent={{
          title: '',
          description: '',
          sections: []
        }}
        onSave={handleSave}
      />;    }

    return (
      <Tabs defaultValue="all">
        <div className="flex items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
          <div className="ml-auto">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsCreating(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Article
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All News Articles</CardTitle>
              <CardDescription>
                View and manage all your news articles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleTable articles={articles} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>Published News Articles</CardTitle>
              <CardDescription>
                View and manage your published news articles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleTable articles={articles} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft News Articles</CardTitle>
              <CardDescription>
                View and manage your draft news articles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleTable articles={articles} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Welcome, {user.name || 'User'}</h2>
      </div>
      {notification && (
        <div className={`fixed top-0 right-0 m-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
      {renderContent()}
    </div>
  );
}
