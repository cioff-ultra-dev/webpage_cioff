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
import { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";

import RatingQuestionUpdate from "./report-questions-form";
import { RatingQuestionsType } from "@/db/queries/reports";
import {
  changeStatusRatingQuestion,
  updateRatingQuestion,
} from "@/lib/reports";
import { cn } from "@/lib/utils";

interface ReportQuestionsTableProps {
  locale: Locale;
  ratingQuestions: RatingQuestionsType;
}

function ReportQuestionsTable({
  locale,
  ratingQuestions,
}: ReportQuestionsTableProps) {
  const [ratingQuestion, setRatingQuestion] = useState<
    RatingQuestionsType[number] | null
  >();

  const router = useRouter();
  const translations = useTranslations();

  const handleStatusChange = useCallback(
    async (ratingQuestionId: number) => {
      try {
        await changeStatusRatingQuestion(ratingQuestionId);

        toast.success(translations("customization.reportQuestions.disabled"));
        router.refresh();
      } catch (e) {
        toast.error(translations("customization.reportQuestions.notDisabled"));
      }
    },
    [router, translations],
  );

  const handleUpdate = useCallback(
    async ({ name }: { name: string }) => {
      try {
        if (!ratingQuestion) return;

        await updateRatingQuestion(ratingQuestion.id, name, locale);

        toast.success(translations("customization.reportQuestions.updated"));
        router.refresh();
      } catch (e) {
        toast.error(translations("customization.reportQuestions.notUpdated"));
      }
    },
    [locale, router, translations, ratingQuestion],
  );

  const items = useMemo(
    () =>
      ratingQuestions.map((question) => {
        const lang = question.langs.find((lang) => lang.l?.code === locale);

        return (
          <TableRow
            key={question.id}
            className={cn(
              question.active ? "" : "bg-muted text-muted-foreground",
            )}
          >
            <TableCell>
              {question.slug || translations("table.pending")}
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
                  <DropdownMenuItem
                    onClick={(e) => setRatingQuestion(question)}
                  >
                    {translations("table.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      handleStatusChange(question.id);
                    }}
                  >
                    <button>
                      {question.active
                        ? translations("table.disable")
                        : translations("table.enable")}
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      }),
    [ratingQuestions, handleStatusChange, locale, translations],
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
      <RatingQuestionUpdate
        isOpen={!!ratingQuestion}
        initialValue={ratingQuestion?.langs[0]?.name ?? ""}
        onClose={() => setRatingQuestion(null)}
        handleClick={handleUpdate}
      />
    </Table>
  );
}

export default ReportQuestionsTable;
