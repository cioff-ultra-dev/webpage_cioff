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
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  deleteSocialMediaLink,
  updateSocialMediaLink,
} from "@/lib/social-media-links";
import {
  SocialMedialLinks,
  SocialMedialLink,
} from "@/db/queries/social-media-links";

import ConfirmDialog from "../../confirmDialog";
import SocialMediaFormModal from "./social-media-form";

interface SocialMediaLinksTableProps {
  socialLinks: SocialMedialLinks;
}

function SocialMediaLinksTable({ socialLinks }: SocialMediaLinksTableProps) {
  const [socialLink, setSocialLink] = useState<SocialMedialLink | null>();

  const router = useRouter();
  const translations = useTranslations();

  const handleRemove = useCallback(
    async (socialLinkId: number) => {
      try {
        await deleteSocialMediaLink(socialLinkId);

        toast.success(translations("customization.social.removed"));
        router.refresh();
      } catch (e) {
        console.log(e);
        toast.error(translations("customization.social.notRemoved"));
      }
    },
    [router, translations]
  );

  const handleUpdate = useCallback(
    async (
      obj: Pick<
        SocialMedialLink,
        "facebookLink" | "instagramLink" | "websiteLink"
      >
    ) => {
      try {
        if (!socialLink) throw new Error("Category not found");

        await updateSocialMediaLink(socialLink.id, obj);

        toast.success(translations("customization.social.updated"));
        router.refresh();
      } catch (e) {
        toast.error(translations("customization.social.notUpdated"));
      }
    },
    [router, translations, socialLink]
  );

  const items = useMemo(
    () =>
      socialLinks.map((socialLink) => {
        return (
          <TableRow
            key={socialLink.id}
            className="max-w-[90vw] grid grid-cols-4"
          >
            <TableCell className="truncate">
              {socialLink.facebookLink || translations("table.pending")}
            </TableCell>
            <TableCell className="truncate">
              {socialLink?.instagramLink || translations("table.pending")}
            </TableCell>
            <TableCell className="truncate">
              {socialLink?.websiteLink || translations("table.pending")}
            </TableCell>
            <TableCell className="w-[100px]" align="center">
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
                  <DropdownMenuItem onClick={(e) => setSocialLink(socialLink)}>
                    {translations("table.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    <ConfirmDialog
                      buttonMessage={translations("table.delete")}
                      buttonVariant="destructive"
                      message={translations(
                        "customization.social.deleteMessage"
                      )}
                      title={translations("customization.social.deleteTitle")}
                      handleClick={() => handleRemove(socialLink.id)}
                    >
                      <DialogTrigger asChild className="w-full text-start">
                        <button>{translations("table.delete")}</button>
                      </DialogTrigger>
                    </ConfirmDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      }),
    [socialLinks, translations, handleRemove]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="max-w-[90vw] grid grid-cols-4">
          <TableHead>{translations("table.facebook")}</TableHead>
          <TableHead>{translations("table.instagram")}</TableHead>
          <TableHead>{translations("table.website")}</TableHead>
          <TableHead className="w-[100px]">
            {translations("table.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{items}</TableBody>
      <SocialMediaFormModal
        isOpen={!!socialLink}
        initialValue={socialLink ?? undefined}
        onClose={() => setSocialLink(null)}
        handleClick={handleUpdate}
      />
    </Table>
  );
}

export default SocialMediaLinksTable;
