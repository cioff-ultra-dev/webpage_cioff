import { formReportFestivalSchema } from "@/components/common/reports/festival-form";
import { formReportGroupSchema } from "@/components/common/reports/group-form";
import { db } from "@/db";
import {
  ratingFestivalToGroups,
  ratingFestivalToGroupsAnswers,
  ratingGroupToFestivals,
  ratingGroupToFestivalsAnswers,
  reportFestival,
  reportFestivalActivities,
  reportFestivalNonGroups,
  reportGroup,
  reportGroupTypeLocales,
  reportGroupTypeLocalesSleep,
} from "@/db/schema";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

function calculateRatingResult(ratings: number[]) {
  const totalRatings = ratings.length;
  if (totalRatings === 0) return 0;

  const sumRatings = ratings.reduce((sum, rating) => sum + rating, 0);
  return sumRatings / totalRatings;
}

export async function POST(request: Request) {
  const result = (await request.json()) as z.infer<
    typeof formReportGroupSchema
  >;
  const t = await getTranslations("notification");

  const reportId = await db.transaction(async (tx) => {
    const [report] = await tx
      .insert(reportGroup)
      .values({
        groupId: result.groupId,
        amountPersonsTravelled: result.amountPersonsTravelled,
        ich: result.ich,
      })
      .returning({ id: reportGroup.id });

    if (!report.id) {
      tx.rollback();
    }

    if (result._reportFestivals.length) {
      const ratingGFs = await tx
        .insert(ratingGroupToFestivals)
        .values(
          result._reportFestivals.map((group) => ({
            reportGroupId: report.id,
            ratingResult: String(
              calculateRatingResult(group._questions.map((q) => q.rating))
            ),
            generalComment: group.generalComment!,
            festivalId: group.festivalId,
            introductionBeforePerformances:
              group.introductionBeforePerformances,
            atLeast5ForeginGroups: group.atLeast5ForeginGroups,
            festivalCoverTravelCosts: group.festivalCoverTravelCosts,
            refreshmentsDuringPerformances:
              group.refreshmentsDuringPerformances,
            typeOfCompensation: group.typeOfCompensation,
            financialCompensation: group.financialCompensation || null,
            inKindCompensation: group.inKindCompensation || "",
          }))
        )
        .returning({
          id: ratingGroupToFestivals.id,
          festivalId: ratingGroupToFestivals.festivalId,
        });

      const ratingGFValues = ratingGFs.flatMap((rating) => {
        const group = result._reportFestivals.find(
          (g) => g.festivalId === rating.festivalId
        );

        return group!._questions.map((q) => ({
          reportGroupToFestivalsId: rating.id,
          ratingQuestionId: q.questionId,
          rating: q.rating,
          comment: q.comment,
        }));
      });

      await tx.insert(ratingGroupToFestivalsAnswers).values(ratingGFValues);

      const reportLocales = ratingGFs.flatMap((rating) => {
        const group = result._reportFestivals.find(
          (g) => g.festivalId === rating.festivalId
        );

        return group!._typeActivitiesLocalesSelected.map((activity) => ({
          reportGroupToFestivalsId: rating.id,
          reportTypeCategoryId: Number(activity),
        }));
      });

      if (reportLocales.length) {
        await tx.insert(reportGroupTypeLocales).values(reportLocales);
      }

      const reportLocalesSleep = ratingGFs.flatMap((rating) => {
        const group = result._reportFestivals.find(
          (g) => g.festivalId === rating.festivalId
        );

        return group!._typeActivitiesSleepsSelected.map((activity) => ({
          reportGroupToFestivalsId: rating.id,
          reportTypeCategoryId: Number(activity),
        }));
      });

      if (reportLocalesSleep.length) {
        await tx.insert(reportGroupTypeLocalesSleep).values(reportLocalesSleep);
      }
    }

    return report.id;
  });

  return Response.json({ success: t("success"), reportId });
}
