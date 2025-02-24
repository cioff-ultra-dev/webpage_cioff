import { formReportFestivalSchema } from "@/components/common/reports/festival-form";
import { db } from "@/db";
import {
  ratingFestivalToGroups,
  ratingFestivalToGroupsAnswers,
  reportFestival,
  reportFestivalActivities,
  reportFestivalNonGroups,
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
    typeof formReportFestivalSchema
  >;
  console.log(result);
  const t = await getTranslations("notification");

  const reportId = await db.transaction(async (tx) => {
    const [report] = await tx
      .insert(reportFestival)
      .values({
        festivalId: result.festivalId,
        amountPeople: result.amountPeople,
        disabledAdults: result.disabledAdults,
        disabledChildren: result.disabledChildren,
        disabledYouth: result.disabledYouth,
        amountPerformances: result.amountPerformances,
        sourceData: result.sourceData,
      })
      .returning({ id: reportFestival.id });

    if (!report.id) {
      tx.rollback();
    }

    if (result._typeActivitiesSelected.length) {
      await tx.insert(reportFestivalActivities).values(
        result._typeActivitiesSelected.map((activity) => ({
          reportFestivalId: report.id,
          reportTypeCategoryId: Number(activity),
        }))
      );
    }

    if (result._isNonCioffGroups && result._currentNonCioffGroups) {
      await tx.insert(reportFestivalNonGroups).values({
        reportFestivalId: report.id,
        howMany: result._currentNonCioffGroups.howMany ?? 0,
        emailProvided: result._currentNonCioffGroups.emailProvided,
      });
    }

    if (result._reportGroups.length) {
      const ratingFGs = await tx
        .insert(ratingFestivalToGroups)
        .values(
          result._reportGroups.map((group) => ({
            reportFestivalId: report.id,
            ratingResult: String(
              calculateRatingResult(group._questions.map((q) => q.rating))
            ),
            generalComment: group.generalComment!,
            groupId: group.groupId,
            isInvitationPerNs: group.isInvitationPerNs,
            isInvitationPerWebsite: group.isInvitationPerWebsite,
            isGroupLiveMusic: group.isGroupLiveMusic,
          }))
        )
        .returning({
          id: ratingFestivalToGroups.id,
          groupId: ratingFestivalToGroups.groupId,
        });

      const ratingFGValues = ratingFGs.flatMap((rating) => {
        const group = result._reportGroups.find(
          (g) => g.groupId === rating.groupId
        );

        return group!._questions.map((q) => ({
          ratingFestivalToGroupsId: rating.id,
          ratingQuestionId: q.questionId,
          rating: q.rating,
          comment: q.comment,
        }));
      });

      await tx.insert(ratingFestivalToGroupsAnswers).values(ratingFGValues);
    }

    return report.id;
  });

  return Response.json({ success: t("success"), reportId });
}
