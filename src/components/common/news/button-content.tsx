"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ButtonContent } from "@/types/article";

function ClientButton({
  buttonLabel,
  openNewTab,
  url,
  variant,
}: ButtonContent) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (openNewTab) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  }, [openNewTab, url, router]);

  return (
    <Button className="my-4 mr-4" onClick={handleClick} variant={variant}>
      {buttonLabel || "Button"}
    </Button>
  );
}

export default ClientButton;
