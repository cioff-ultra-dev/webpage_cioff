// "use client";

// import React, { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import useSWR, { preload } from "swr";
// import useSWRInfinite from "swr/infinite";
// import InfiniteScroll from "@/components/extension/swr-infinite-scroll";
// import fetcher, { cn } from "@/lib/utils";
// import { SelectFestival } from "@/db/schema";
// import { CalendarCheck } from "lucide-react";
// import { format } from "date-fns";
// import { DatePickerWithRange } from "@/components/ui/datepicker-with-range";
// import { DateRange } from "react-day-picker";
// import Link from "next/link";
// import { Badge } from "@/components/ui/badge";
// import { CountryCastFestivals } from "@/db/queries/countries";
// import { SWRProvider } from "@/components/provider/swr";
// import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip";
// import Image from "next/image";
// import { Skeleton } from "../ui/skeleton";
// import { BuildFilterType } from "@/app/api/filter/route";
// import { useFormatter, useLocale, useTranslations } from "next-intl";
// import { RegionsType } from "@/db/queries/regions";
// import { CountryCastGroups } from "@/db/queries/groups";
// import { Label } from "../ui/label";
// import { Card, CardContent } from "../ui/card";
// import { MultiSelect, MultiSelectProps } from "../ui/multi-select";
// import { CategoriesType } from "@/db/queries/categories";
// import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
// import { TabsContent } from "@radix-ui/react-tabs";
// import { BuildGroupFilterType } from "@/app/api/filter/group/route";

// preload("/api/filter?categories=[]&countryId=0&page=1", fetcher);
// preload("/api/filter/country", fetcher);

// function SkeletonList() {
//   return (
//     <>
//       {Array.from({ length: 6 }).map((_, index) => (
//         <div
//           key={`skeleton-list-search-${index}`}
//           className="bg-gray-50 p-4 rounded-lg flex flex-col space-y-4 w-full"
//         >
//           <Skeleton className="h-64 sm:h-48 bg-gray-300 rounded-lg" />
//           <Skeleton className="h-4 w-[250px] bg-gray-300" />
//           <div className="space-y-2">
//             <Skeleton className="h-4 w-[200px] bg-gray-300" />
//             <Skeleton className="h-6 w-[250px] bg-gray-300" />
//           </div>
//         </div>
//       ))}
//     </>
//   );
// }

// export function WrapperFilter({
//   searchParams,
//   categories,
// }: {
//   searchParams: { [key: string]: string | string[] | undefined };
//   categories: CategoriesType;
// }) {
//   const locale = useLocale();
//   const t = useTranslations("maps");
//   const tf = useTranslations("filters");
//   const formatter = useFormatter();

//   const [tabSelected, setTabSelected] = useState<string>(
//     (searchParams.type as string) || "festivals"
//   );
//   const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
//   const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
//   const [search, setSearch] = useState(
//     `search=${searchParams?.search ?? ""}&rangeDateFrom=${
//       searchParams?.rangeDateFrom ?? ""
//     }&rangeDateTo=${searchParams?.rangeDateTo ?? ""}`
//   );
//   const [selectedCategories, setSelectedCategories] = useState<string[]>(
//     Array.from(JSON.parse((searchParams?.categories as string) || "[]"))
//   );
//   const [dateRange, setDateRange] = useState<DateRange | undefined>();

//   const { data: regionCast = [], isLoading: isLoadingRegionCast } =
//     useSWR<RegionsType>(`/api/filter/region?locale=${locale}`, fetcher);

//   const { data: countryCast = [], isLoading: isLoadingCountryCast } =
//     useSWR<CountryCastFestivals>(
//       () =>
//         tabSelected === "festivals"
//           ? `/api/filter/country?locale=${locale}&regions=${JSON.stringify(
//               selectedRegions
//             )}`
//           : null,
//       fetcher
//     );

//   const swr = useSWRInfinite<BuildFilterType>(
//     (index, _) =>
//       `api/filter?categories=${JSON.stringify(
//         selectedCategories
//       )}&type=${tabSelected}&locale=${locale}&regions=${JSON.stringify(
//         selectedRegions
//       )}&countries=${JSON.stringify(
//         selectedCountries.length ? selectedCountries : []
//       )}&page=${index + 1}${search ? `&${search}` : ""}`,
//     fetcher
//   );

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     const searchValue = event.currentTarget.elements.search.value;
//     setSearch(
//       `search=${searchValue}&rangeDateFrom=${
//         dateRange?.from ? Math.floor(dateRange!.from!.getTime() / 1000) : ""
//       }&rangeDateTo=${
//         dateRange?.to ? Math.floor(dateRange!.to!.getTime() / 1000) : ""
//       }`
//     );
//   }

//   return (
//     <Tabs
//       defaultValue="festivals"
//       value={tabSelected}
//       className="w-full pt-6 bg-gray-50"
//       onValueChange={(value) => setTabSelected(value)}
//     >
//       <TabsContent value="festivals">
//         <section className="bg-gray-50 py-4 sm:py-8">
//           <div className="container mx-auto">
//             <Card>
//               <CardContent className="pt-4">
//                 <form
//                   onSubmit={handleSubmit}
//                   className="flex flex-col items-end space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
//                 >
//                   <div className="flex-1">
//                     <Label className="pb-1">{tf("search")}</Label>
//                     <Input placeholder="Type to explore..." name="search" />
//                   </div>
//                   <div className="flex-1">
//                     <Label>{tf("categories")}</Label>
//                     <MultiSelect
//                       options={categories}
//                       onValueChange={setSelectedCategories}
//                       placeholder={tf("select_categories")}
//                     />
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//         <section className="bg-white py-4 sm:py-8">
//           <div className="container mx-auto px-4">
//             <div className="grid grid-cols-3 gap-4 w-full">
//               <InfiniteScroll
//                 swr={swr}
//                 loadingIndicator={<SkeletonList />}
//                 classNameWrapper="w-full col-span-3" isReachingEnd={false}              >
//                 {(response) =>
//                   response.map(({ festival }) => (
//                     <Link
//                       href={`/festivals/${festival.id}`}
//                       className="bg-gray-50 p-4 rounded-lg w-full"
//                       target="_blank"
//                       key={festival.id}
//                     >
//                       <h3 className="text-black">{festival.name}</h3>
//                     </Link>
//                   ))
//                 }
//               </InfiniteScroll>
//             </div>
//           </div>
//         </section>
//       </TabsContent>
//     </Tabs>
//   );
// }

// export default WrapperFilter;
