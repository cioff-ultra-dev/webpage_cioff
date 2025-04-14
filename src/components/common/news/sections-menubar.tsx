import {
  Pilcrow,
  ImageIcon,
  VideoIcon,
  GalleryHorizontal,
  Newspaper,
  Youtube,
  SquareMinus,
  PanelTop,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/types/article";

interface SectionsMenuProps {
  addSection: (type: Section["type"]) => void;
  onExit?: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function SectionsMenubar(props: SectionsMenuProps) {
  const { addSection, onSubmit, onExit } = props;

  const translations = useTranslations("news.form");

  return (
    <Card className="sticky bottom-5 mt-4 right-0 flex justify-between items-center gap-4 w-full ">
      <CardContent className="flex-row items-center p-4 gap-2 flex w-full">
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.paragraph")}
          onClick={() => addSection("paragraph")}
        >
          <Pilcrow className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.image")}
          onClick={() => addSection("image")}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.video")}
          onClick={() => addSection("video")}
        >
          <VideoIcon className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.carousel")}
          onClick={() => addSection("carousel")}
        >
          <GalleryHorizontal className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.news")}
          onClick={() => addSection("news")}
        >
          <Newspaper className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.youtube")}
          onClick={() => addSection("youtube")}
        >
          <Youtube className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.button")}
          onClick={() => addSection("button")}
        >
          <SquareMinus className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title={translations("sections.banner")}
          onClick={() => addSection("banner")}
        >
          <PanelTop className="h-5 w-5" />
        </Button>
      </CardContent>
      <CardContent className="flex-row items-center p-4 flex w-full justify-end">
        <div className="flex gap-2">
          {onExit && (
            <Button variant="secondary" onClick={onExit}>
              {translations("sections.cancel")}
            </Button>
          )}
          <Button onClick={onSubmit}>{translations("sections.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
