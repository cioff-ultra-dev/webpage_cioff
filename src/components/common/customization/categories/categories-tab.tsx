import { useCallback, BaseSyntheticEvent } from "react";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createCategory } from "@/lib/categories";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n/config";
import { DialogTrigger } from "@/components/ui/dialog";
import { CategoriesType } from "@/db/queries/categories";

import CategoriesTable from "./categories-table";
import CategoryFormModal from "./category-form";

function CategoriesTab({
  locale,
  categories,
}: {
  locale: Locale;
  categories?: CategoriesType;
}) {
  const router = useRouter();
  const translations = useTranslations("customization");

  const handleSubmit = useCallback(
    async ({ name }: { name: string }) => {
      try {
        await createCategory(name, locale);

        toast.success(translations("categories.success"));
        router.refresh();
      } catch (error) {
        toast.error(translations("categories.error"));
      }
    },
    [locale, router, translations]
  );

  return (
    <TabsContent value="categories">
      <Card>
        <CardHeader className="w-full flex justify-between flex-row">
          <div>
            <CardTitle>{translations("tabs.categories")}</CardTitle>
            <CardDescription>
              {translations("categories.description")}
            </CardDescription>
          </div>
          <CategoryFormModal handleClick={handleSubmit}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {translations("categories.addItem")}
                </span>
              </Button>
            </DialogTrigger>
          </CategoryFormModal>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <CategoriesTable locale={locale} categories={categories ?? []} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default CategoriesTab;
