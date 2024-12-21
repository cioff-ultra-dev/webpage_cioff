"use client";

import { useMemo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { CategoriesType, CategoryType } from "@/db/queries/categories";
import { Locale } from "@/i18n/config";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteCategory, updateCategory } from "@/lib/categories";

import ConfirmDialog from "../../confirmDialog";
import CategoryUpdate from "./category-form";

interface CategoriesTableProps {
  categories: CategoriesType;
  locale: Locale;
}

function CategoriesTable({ categories, locale }: CategoriesTableProps) {
  const [category, setCategory] = useState<CategoryType | null>();

  const router = useRouter();
  const translations = useTranslations();

  const handleRemove = useCallback(
    async (categoryId: number) => {
      try {
        await deleteCategory(categoryId);

        toast.success(translations("customization.categories.removed"));
        router.refresh();
      } catch (e) {
        toast.error(translations("customization.categories.notRemoved"));
      }
    },
    [router, translations]
  );

  const handleUpdate = useCallback(
    async ({ name }: { name: string }) => {
      try {
        if (!category) throw new Error("Category not found");

        await updateCategory(category.id, name, locale);

        toast.success(translations("customization.categories.updated"));
        router.refresh();
      } catch (e) {
        toast.error(translations("customization.categories.notUpdated"));
      }
    },
    [locale, router, translations, category]
  );

  const items = useMemo(
    () =>
      categories.map((category) => {
        const lang = category.langs.find((lang) => lang.l?.code === locale);

        return (
          <TableRow key={category.id}>
            <TableCell>
              {category.slug || translations("table.pending")}
            </TableCell>
            <TableCell>{lang?.name || translations("table.pending")}</TableCell>
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
                  <DropdownMenuItem onClick={(e) => setCategory(category)}>
                    {translations("table.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    <ConfirmDialog
                      buttonMessage={translations("table.delete")}
                      buttonVariant="destructive"
                      message={translations(
                        "customization.categories.deleteMessage",
                        {
                          name: lang?.name ?? "name",
                        }
                      )}
                      title={translations(
                        "customization.categories.deleteTitle"
                      )}
                      handleClick={() => handleRemove(category.id)}
                    >
                      <DialogTrigger asChild className="w-full text-start">
                        <button>{translations("table.delete")}</button>
                      </DialogTrigger>
                    </ConfirmDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      }),
    [categories, handleRemove, locale, translations]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{translations("table.slug")}</TableHead>
          <TableHead>{translations("table.name")}</TableHead>
          <TableHead className="w-[100px]">
            {translations("table.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{items}</TableBody>
      <CategoryUpdate
        isOpen={!!category}
        initialValue={category?.langs[0]?.name ?? ""}
        onClose={() => setCategory(null)}
        handleClick={handleUpdate}
      />
    </Table>
  );
}

export default CategoriesTable;
