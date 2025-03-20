import { formReportGroupSchema } from "@/components/common/reports/group-form";
import { db } from "@/db";
import {
  ratingGroupToFestivals,
  ratingGroupToFestivalsAnswers,
  reportGroup,
  reportGroupTypeLocales,
  reportGroupTypeLocalesSleep,
} from "@/db/schema";
import { getLocale, getTranslations } from "next-intl/server";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { getReportGroup } from "@/db/queries/reports";

function calculateRatingResult(ratings: number[]) {
  const totalRatings = ratings.length;
  if (totalRatings === 0) return 0;

  const sumRatings = ratings.reduce((sum, rating) => sum + rating, 0);
  return sumRatings / totalRatings;
}

export async function POST(request: NextRequest) {
  const locale = await getLocale();
  const searchParams = request.nextUrl.searchParams;
  const result = (await request.json()) as z.infer<
    typeof formReportGroupSchema
  >;
  const reportNextId = Number(searchParams.get("reportId"));
  const t = await getTranslations("notification");
  const currentReport = await getReportGroup(reportNextId, locale);

  if (!reportNextId || !currentReport) {
    return Response.json({ error: t("report_not_found") }, { status: 404 });
  }

  const reportId = await db.transaction(async (tx) => {
    await tx
      .update(reportGroup)
      .set({
        groupId: result.groupId,
        amountPersonsTravelled: result.amountPersonsTravelled,
        ich: result.ich,
        draft: !!result._shouldDraft,
      })
      .where(eq(reportGroup.id, reportNextId));

    // 2. Handle the ratings for festivals (complex many-to-many relationship)
    // First, get existing ratings
    const existingRatings = await tx
      .select({
        id: ratingGroupToFestivals.id,
        festivalId: ratingGroupToFestivals.festivalId,
      })
      .from(ratingGroupToFestivals)
      .where(eq(ratingGroupToFestivals.reportGroupId, reportNextId));

    // Create a map for easier lookup
    const existingRatingsMap = new Map(
      existingRatings.map((rating) => [rating.festivalId, rating.id])
    );

    // Track which festivals are in the updated report
    const updatedFestivalIds = new Set<number>();

    // Process each festival in the input
    for (const festival of result._reportFestivals) {
      const festivalId = festival.festivalId!;
      updatedFestivalIds.add(festivalId);

      const ratingValue = String(
        calculateRatingResult(festival._questions.map((q) => q.rating))
      );

      const existingRatingId = existingRatingsMap.get(festivalId);

      if (existingRatingId) {
        // Update existing rating
        await tx
          .update(ratingGroupToFestivals)
          .set({
            ratingResult: ratingValue,
            generalComment: festival.generalComment!,
            introductionBeforePerformances:
              festival.introductionBeforePerformances,
            atLeast5ForeginGroups: festival.atLeast5ForeginGroups,
            festivalCoverTravelCosts: festival.festivalCoverTravelCosts,
            refreshmentsDuringPerformances:
              festival.refreshmentsDuringPerformances,
            typeOfCompensation: festival.typeOfCompensation,
            financialCompensation: festival.financialCompensation || null,
            inKindCompensation: festival.inKindCompensation || "",
          })
          .where(eq(ratingGroupToFestivals.id, existingRatingId));

        // Delete old answers
        await tx
          .delete(ratingGroupToFestivalsAnswers)
          .where(
            eq(
              ratingGroupToFestivalsAnswers.reportGroupToFestivalsId,
              existingRatingId
            )
          );

        // Insert new answers
        await tx.insert(ratingGroupToFestivalsAnswers).values(
          festival._questions.map((q) => ({
            reportGroupToFestivalsId: existingRatingId,
            ratingQuestionId: q.questionId,
            rating: q.rating,
            comment: q.comment,
          }))
        );

        // Delete old locales
        await tx
          .delete(reportGroupTypeLocales)
          .where(
            eq(
              reportGroupTypeLocales.reportGroupToFestivalsId,
              existingRatingId
            )
          );

        // Insert new locales if any
        if (festival._typeActivitiesLocalesSelected?.length) {
          await tx.insert(reportGroupTypeLocales).values(
            festival._typeActivitiesLocalesSelected.map((activity) => ({
              reportGroupToFestivalsId: existingRatingId,
              reportTypeCategoryId: Number(activity),
            }))
          );
        }

        // Delete old sleep locales
        await tx
          .delete(reportGroupTypeLocalesSleep)
          .where(
            eq(
              reportGroupTypeLocalesSleep.reportGroupToFestivalsId,
              existingRatingId
            )
          );

        // Insert new sleep locales if any
        if (festival._typeActivitiesSleepsSelected?.length) {
          await tx.insert(reportGroupTypeLocalesSleep).values(
            festival._typeActivitiesSleepsSelected.map((activity) => ({
              reportGroupToFestivalsId: existingRatingId,
              reportTypeCategoryId: Number(activity),
            }))
          );
        }
      } else {
        // Insert new rating for this festival
        const [newRating] = await tx
          .insert(ratingGroupToFestivals)
          .values({
            reportGroupId: reportNextId,
            ratingResult: ratingValue,
            generalComment: festival.generalComment!,
            festivalId: festivalId,
            introductionBeforePerformances:
              festival.introductionBeforePerformances,
            atLeast5ForeginGroups: festival.atLeast5ForeginGroups,
            festivalCoverTravelCosts: festival.festivalCoverTravelCosts,
            refreshmentsDuringPerformances:
              festival.refreshmentsDuringPerformances,
            typeOfCompensation: festival.typeOfCompensation,
            financialCompensation: festival.financialCompensation || null,
            inKindCompensation: festival.inKindCompensation || "",
          })
          .returning({ id: ratingGroupToFestivals.id });

        // Insert new answers
        await tx.insert(ratingGroupToFestivalsAnswers).values(
          festival._questions.map((q) => ({
            reportGroupToFestivalsId: newRating.id,
            ratingQuestionId: q.questionId,
            rating: q.rating,
            comment: q.comment,
          }))
        );

        // Insert new locales if any
        if (festival._typeActivitiesLocalesSelected?.length) {
          await tx.insert(reportGroupTypeLocales).values(
            festival._typeActivitiesLocalesSelected.map((activity) => ({
              reportGroupToFestivalsId: newRating.id,
              reportTypeCategoryId: Number(activity),
            }))
          );
        }

        // Insert new sleep locales if any
        if (festival._typeActivitiesSleepsSelected?.length) {
          await tx.insert(reportGroupTypeLocalesSleep).values(
            festival._typeActivitiesSleepsSelected.map((activity) => ({
              reportGroupToFestivalsId: newRating.id,
              reportTypeCategoryId: Number(activity),
            }))
          );
        }
      }
    }

    // Delete ratings for festivals that are no longer in the input
    for (const [festivalId, ratingId] of Array.from(
      existingRatingsMap.entries()
    )) {
      if (festivalId && !updatedFestivalIds.has(festivalId)) {
        // Delete related answers
        await tx
          .delete(ratingGroupToFestivalsAnswers)
          .where(
            eq(ratingGroupToFestivalsAnswers.reportGroupToFestivalsId, ratingId)
          );

        // Delete related locales
        await tx
          .delete(reportGroupTypeLocales)
          .where(eq(reportGroupTypeLocales.reportGroupToFestivalsId, ratingId));

        // Delete related sleep locales
        await tx
          .delete(reportGroupTypeLocalesSleep)
          .where(
            eq(reportGroupTypeLocalesSleep.reportGroupToFestivalsId, ratingId)
          );

        // Delete the rating itself
        await tx
          .delete(ratingGroupToFestivals)
          .where(eq(ratingGroupToFestivals.id, ratingId));
      }
    }

    return reportNextId;
  });

  return Response.json({ success: t("success"), reportId });
}
