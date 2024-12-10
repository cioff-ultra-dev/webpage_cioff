"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogPortal,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  children: ReactNode;
  handleClick: () => void;
  message: string;
  title: string;
  buttonMessage: string;
  buttonVariant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function ConfirmDialog({
  children,
  handleClick,
  title,
  message,
  buttonMessage,
  buttonVariant,
}: ConfirmDialogProps) {
  return (
    <Dialog>
      {children}
      <DialogPortal>
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span className="mb-4">{message}</span>
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild onClick={handleClick}>
              <Button variant={buttonVariant}>{buttonMessage}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
