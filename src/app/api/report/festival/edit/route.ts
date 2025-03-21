import { formReportFestivalSchema } from "@/components/common/reports/festival-form";
import { db } from "@/db";
import { getReportFestival } from "@/db/queries/reports";
import {
  ratingFestivalToGroups,
  ratingFestivalToGroupsAnswers,
  reportFestival,
  reportFestivalActivities,
  reportFestivalNonGroups,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

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
    typeof formReportFestivalSchema
  >;
  const reportNextId = Number(searchParams.get("reportId"));
  const t = await getTranslations("notification");
  const currentReport = await getReportFestival(reportNextId, locale);

  if (!reportNextId || !currentReport) {
    return Response.json(
      {
        error: t("report_not_found"),
      },
      {
        status: 404,
      }
    );
  }

  const reportId = await db.transaction(async (tx) => {
    await tx
      .update(reportFestival)
      .set({
        festivalId: result.festivalId,
        amountPeople: result.amountPeople,
        disabledAdults: result.disabledAdults,
        disabledChildren: result.disabledChildren,
        disabledYouth: result.disabledYouth,
        amountPerformances: result.amountPerformances,
        sourceData: result.sourceData,
        averageCostTicket: result.averageCostTicket,
        draft: !!result._shouldDraft,
      })
      .where(eq(reportFestival.id, reportNextId));

    await tx
      .delete(reportFestivalActivities)
      .where(eq(reportFestivalActivities.reportFestivalId, reportNextId));

    if (result._typeActivitiesSelected.length) {
      await tx.insert(reportFestivalActivities).values(
        result._typeActivitiesSelected.map((activity) => ({
          reportFestivalId: reportNextId,
          reportTypeCategoryId: Number(activity),
        }))
      );
    }

    await tx
      .delete(reportFestivalNonGroups)
      .where(eq(reportFestivalNonGroups.reportFestivalId, reportNextId));

    if (result._isNonCioffGroups && result._currentNonCioffGroups) {
      await tx.insert(reportFestivalNonGroups).values(
        result._currentNonCioffGroups.map((group) => ({
          reportFestivalId: reportNextId,
          emailProvided: group?.emailProvided,
        }))
      );
    }

    const existingRatings = await tx
      .select({
        id: ratingFestivalToGroups.id,
        groupId: ratingFestivalToGroups.groupId,
      })
      .from(ratingFestivalToGroups)
      .where(eq(ratingFestivalToGroups.reportFestivalId, reportNextId));

    const existingRatingsMap = new Map(
      existingRatings.map((rating) => [rating.groupId, rating.id])
    );

    for (const group of result._reportGroups) {
      const ratingValue = String(
        calculateRatingResult(group._questions.map((q) => q.rating))
      );

      const existingRatingId = existingRatingsMap.get(group.groupId!);

      if (existingRatingId) {
        await tx
          .update(ratingFestivalToGroups)
          .set({
            ratingResult: ratingValue,
            generalComment: group.generalComment!,
            isGroupLiveMusic: group.isGroupLiveMusic,

            amountPersonsGroup: group.amountPersonsGroup,
          })
          .where(eq(ratingFestivalToGroups.id, existingRatingId));

        await tx
          .delete(ratingFestivalToGroupsAnswers)
          .where(
            eq(
              ratingFestivalToGroupsAnswers.ratingFestivalToGroupsId,
              existingRatingId
            )
          );

        await tx.insert(ratingFestivalToGroupsAnswers).values(
          group._questions.map((q) => ({
            ratingFestivalToGroupsId: existingRatingId,
            ratingQuestionId: q.questionId,
            rating: q.rating,
            comment: q.comment,
          }))
        );

        // eslint-disable-next-line drizzle/enforce-delete-with-where
        existingRatingsMap.delete(group.groupId!);
      } else {
        const [newRating] = await tx
          .insert(ratingFestivalToGroups)
          .values({
            reportFestivalId: reportNextId,
            ratingResult: ratingValue,
            generalComment: group.generalComment!,
            groupId: group.groupId,
            isInvitationPerNs: group.isInvitationPerNs,
            isInvitationPerWebsite: group.isInvitationPerWebsite,
            isGroupLiveMusic: group.isGroupLiveMusic,
          })
          .returning({ id: ratingFestivalToGroups.id });

        await tx.insert(ratingFestivalToGroupsAnswers).values(
          group._questions.map((q) => ({
            ratingFestivalToGroupsId: newRating.id,
            ratingQuestionId: q.questionId,
            rating: q.rating,
            comment: q.comment,
          }))
        );
      }
    }

    for (const [_, ratingId] of Array.from(existingRatingsMap.entries())) {
      await tx
        .delete(ratingFestivalToGroupsAnswers)
        .where(
          eq(ratingFestivalToGroupsAnswers.ratingFestivalToGroupsId, ratingId)
        );

      await tx
        .delete(ratingFestivalToGroups)
        .where(eq(ratingFestivalToGroups.id, ratingId));
    }

    return reportNextId;
  });

  return Response.json({ success: t("success"), reportId });
}
