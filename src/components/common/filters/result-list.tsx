import { JSX, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {  useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { Skeleton } from "../../ui/skeleton";
import { FilterCardProps, FilterCard } from "./filter-card";

export type ResultList = FilterCardProps[];

interface ResultListProps {
  isLoading: boolean;
  results: ResultList;
  viewMoreLink: string;
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-list-search-${index}`}
          className="bg-gray-50 p-4 rounded-lg flex flex-col space-y-4 w-full"
        >
          <Skeleton className="h-64 sm:h-48 bg-gray-300 rounded-lg" />
          <Skeleton className="h-4 w-[250px] bg-gray-300" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px] bg-gray-300" />
            <Skeleton className="h-6 w-[250px] bg-gray-300" />
          </div>
        </div>
      ))}
    </>
  );
}

export function ResultList(props: ResultListProps): JSX.Element {
  const { isLoading, results, viewMoreLink } = props;

    const router = useRouter();
    const translations = useTranslations("common");

  const component = useMemo(
    () =>
      isLoading ? (
        <SkeletonList />
      ) : (
        results.map((result, index) => <FilterCard key={index} {...result} />)
      ),
    [isLoading, results]
  );

  const handleViewMore = useCallback(() => router.push(viewMoreLink), [router, viewMoreLink]);

  return (
    <div className="relative py-4 !mt-14 px-52 max-lg:px-24 max-md:px-28 max-sm:px-8">
      <span className="font-medium">
        {translations("results", {
          total: Array.isArray(results) ? results.length : 0,
        })}
      </span>
      <div className="grid grid-cols-5 gap-4 h-full w-full max-sm:grid-cols-1 max-md:grid-cols-2 max-lg:grid-cols-4 mt-4">
        {component}
        {!!results?.length && (
          <div className="w-full h-full flex justify-center items-center col-span-5 max-sm:col-span-1 max-md:col-span-2 max-lg:col-span-4 mt-6">
            <Button
              size="sm"
              className="rounded-xl text-roboto font-semibold text-xs px-4 text-white hover:bg-white hover:text-primary hover:border hover:border-primary"
              onClick={handleViewMore}
            >
              {translations("viewMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
