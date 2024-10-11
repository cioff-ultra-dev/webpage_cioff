"use client";

import { ReactNode, useCallback, useState } from "react";
import { Dialog } from "../ui/dialog";
import SendInvitation from "./send-invitation";
import { GroupByOwnerType } from "@/db/queries/groups";

type GroupType = GroupByOwnerType[number]["group"];

export default function MenuActions({
  children,
  item,
}: {
  children: ReactNode;
  item: GroupType;
}) {
  const [open, setOpen] = useState(false);

  const handleSetOpen = useCallback(
    (value: boolean) => {
      setOpen(value);
    },
    [setOpen],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <SendInvitation
        email={item?.owners?.at(0)?.user?.email || ""}
        userId={item?.owners.at(0)?.userId || ""}
        ownerId={item?.owners.at(0)?.id || undefined}
        groupId={item?.id!}
        roleName="Groups"
        countryId={item?.countryId!}
        open={open}
        setOpen={handleSetOpen}
      />
    </Dialog>
  );
}
