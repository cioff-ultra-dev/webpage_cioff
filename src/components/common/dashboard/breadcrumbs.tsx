"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { useTranslations } from "next-intl";

type TBreadCrumbProps = {
  homeElement?: ReactNode;
  capitalizeLinks?: boolean;
};

export default function DashboardBreadcrumb({
  homeElement,
  capitalizeLinks,
}: TBreadCrumbProps) {
  const paths = usePathname();
  const t = useTranslations("link");
  const pathNames = paths.split("/").filter((path) => path);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {homeElement ? (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" prefetch={false}>
                {homeElement}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : null}
        {pathNames.length > 0 && homeElement ? <BreadcrumbSeparator /> : null}
        {pathNames.map((link, index) => {
          let href = `/${pathNames.slice(0, index + 1).join("/")}`;
          return (
            <React.Fragment key={index}>
              {href !== paths ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link className="capitalize" href={href} prefetch={false}>
                        {t(link.replaceAll("-", " "))}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathNames.length !== index + 1 ? (
                    <BreadcrumbSeparator />
                  ) : null}
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{t(link)}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
