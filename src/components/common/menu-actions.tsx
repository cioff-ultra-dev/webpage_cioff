"use client";

import { ReactNode, useCallback, useState } from "react";
import { Dialog } from "../ui/dialog";
import SendInvitation from "./send-invitation";
import { GroupByOwnerType } from "@/db/queries/groups";
import { FestivalByOwnerType } from "@/db/queries/events";

type GroupType = GroupByOwnerType[number]["group"];
type FestivalType = FestivalByOwnerType[number]["festival"];

export default function MenuActions({
  children,
  item,
  roleName = "Groups",
  fallbackEmail,
}: {
  children: ReactNode;
  item: GroupType | FestivalType;
  roleName?: string;
  fallbackEmail?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleSetOpen = useCallback(
    (value: boolean) => {
      setOpen(value);
    },
    [setOpen]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <SendInvitation
        key={item?.owners?.at(0)?.user?.email || fallbackEmail}
        email={item?.owners?.at(0)?.user?.email || fallbackEmail || ""}
        userId={item?.owners.at(0)?.userId || ""}
        ownerId={item?.owners.at(0)?.id || undefined}
        groupId={roleName === "Groups" ? item?.id! : undefined}
        festivalId={roleName === "Festivals" ? item?.id! : undefined}
        roleName={roleName}
        countryId={item?.countryId!}
        open={open}
        setOpen={handleSetOpen}
      />
    </Dialog>
  );
}
