"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

import RatingQuestionialogormModal from "./report-questions-form";
import { RatingQuestionsType, ReportRatingType } from "@/db/queries/reports";
import ReportQuestionsTable from "./report-questions-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRatingQuestion } from "@/lib/reports";

function ReportQuestionsTab({
  locale,
  ratingTypes,
  ratingQuestions,
}: {
  locale: Locale;
  ratingTypes?: ReportRatingType;
  ratingQuestions?: RatingQuestionsType;
}) {
  const router = useRouter();
  const translations = useTranslations("customization");
  const [ratingType, setRatingType] = useState<number | undefined>(
    ratingTypes?.at(0)?.id,
  );

  const handleSubmit = useCallback(
    async ({ name }: { name: string }) => {
      if (ratingType) {
        try {
          await createRatingQuestion(name, ratingType, locale);

          toast.success(translations("reportQuestions.added"));
          router.refresh();
        } catch (error) {
          toast.error(translations("reportQuestions.error"));
        }
      }
    },
    [locale, router, translations, ratingType],
  );

  const ratingQuestionsSelected = useMemo(() => {
    return ratingQuestions?.filter(
      (question) => question.ratingTypeId === ratingType,
    );
  }, [ratingType, ratingQuestions]);

  console.log({ ratingType, ratingQuestions, ratingQuestionsSelected });

  return (
    <TabsContent value="report-questions">
      <Card>
        <CardHeader className="w-full flex justify-between flex-row">
          <div>
            <CardTitle>{translations("tabs.reportQuestions")}</CardTitle>
            <CardDescription>
              {translations("reportQuestions.description")}
            </CardDescription>
          </div>
          <div className="flex gap-1 items-center">
            <Select
              value={ratingType ? String(ratingType) : undefined}
              onValueChange={(value) => {
                if (value) {
                  setRatingType(Number(value));
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={translations("reportQuestions.selectOption")}
                />
              </SelectTrigger>
              <SelectContent>
                {ratingTypes?.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {translations(`reportQuestions.${type.name}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RatingQuestionialogormModal handleClick={handleSubmit}>
              <DialogTrigger asChild>
                <Button size="lg" variant="ghost" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {translations("reportQuestions.addQuestion")}
                  </span>
                </Button>
              </DialogTrigger>
            </RatingQuestionialogormModal>
          </div>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <ReportQuestionsTable
            locale={locale}
            ratingQuestions={ratingQuestionsSelected ?? []}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default ReportQuestionsTab;
