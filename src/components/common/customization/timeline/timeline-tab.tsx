import React, { useState, useCallback, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  FilePondFile,
  FilePondErrorDescription,
  FilePondInitialFile,
} from "filepond";
import { ImageIcon, VideoIcon, Youtube, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TimelineSection } from "@/types/customization";
import { FilepondImageUploader } from "@/components/extension/filepond-image-uploader";
import { Locale } from "@/i18n/config";
import { TimelineType, updateTimelineInfo } from "@/db/queries/timeline";

function TimelineTab({
  locale,
  timeline,
}: {
  locale: Locale;
  timeline: TimelineType;
}) {
  const [sections, setSections] = useState<TimelineSection[]>([]);

  const translations = useTranslations("customization");

  useEffect(() => {
    if (timeline?.sections)
      setSections(timeline?.sections as TimelineSection[]);
  }, [timeline]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(sections);
      const [reorderedItem] = items.splice(result.source.index, 1);

      items.splice(result.destination.index, 0, reorderedItem);

      setSections(items);
    },
    [sections]
  );

  const addSection = (type: TimelineSection["type"]) => {
    const newSection: TimelineSection = {
      id: Date.now().toString(),
      type,
      url: "",
      description: "",
      position: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = useCallback(
    (id: string, key: string, value: string) => {
      setSections((sections) =>
        sections.map((section) =>
          section.id === id ? { ...section, [key]: value } : section
        )
      );
    },
    []
  );

  const removeSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const onProcessFile = useCallback(
    (section: TimelineSection) =>
      (error: FilePondErrorDescription | null, file: FilePondFile) => {
        if (error) {
          console.error(error);
          return;
        }

        updateSection(
          section.id,
          "url",
          section.url.length > 0
            ? section.url.concat(",", file.serverId)
            : file.serverId
        );
      },
    [updateSection]
  );

  const renderSection = useCallback(
    (section: TimelineSection) => {
      if (section.type === "image" || section.type === "video") {
        const callback = onProcessFile(section);
        const isImage = section.type === "image";
        const props = {
          acceptedFileTypes: [isImage ? "image/*" : "video/mp4"],
          id: isImage ? "photos" : "videos",
          name: isImage ? "photos" : "videos",
        };

        const initialFiles: FilePondInitialFile[] =
          typeof section.url === "string" && section.url.length > 0
            ? section.url.split(",").map((source) => ({
                source,
                options: {
                  type: "local",
                },
              }))
            : [];

        return (
          <FilepondImageUploader
            allowMultiple
            maxFiles={5}
            defaultFiles={initialFiles}
            onprocessfile={callback}
            {...props}
          />
        );
      }

      if (section.type === "youtube")
        return (
          <div className="mb-4 px-1">
            <label className="text-sm font-medium">Youtube url</label>
            <Input
              value={section.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateSection(section.id, "url", e.target.value)
              }
              className="focus-visible:ring-0  mt-2"
            />
          </div>
        );
    },
    [onProcessFile, updateSection]
  );

  const handleSubmit = useCallback(async () => {
    try {
      await updateTimelineInfo(sections, locale);
      toast.success(translations("timeline.updated"));
    } catch (e) {
      console.error(e);

      toast.error(translations("timeline.notUpdated"));
    }
  }, [sections, locale]);

  return (
    <TabsContent value="timeline">
      <Card>
        <CardHeader className="w-full flex justify-between flex-row">
          <div>
            <CardTitle>{translations("tabs.timeline")}</CardTitle>
            <CardDescription>
              {translations("timeline.description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="article">
              {(provided) => (
                <article {...provided.droppableProps} ref={provided.innerRef}>
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-4 p-2 border border-gray-200 rounded"
                        >
                          {renderSection(section)}

                          {section.type === "image" ? (
                            <div className="mb-4 px-1">
                              <label className="text-sm font-medium">
                                {translations("timeline.contentDescription")}
                              </label>
                              <Input
                                value={section.description}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateSection(
                                    section.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="focus-visible:ring-0  mt-2"
                              />
                            </div>
                          ) : null}
                          <Button
                            onClick={() => removeSection(section.id)}
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            title={translations("remove")}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </article>
              )}
            </Droppable>
          </DragDropContext>
          <Card className="sticky bottom-5 mt-4 right-0 flex justify-between items-center gap-4 w-full h-16">
            <CardContent className="flex-row items-center p-4 gap-2 flex w-full">
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
                title={translations("sections.youtube")}
                onClick={() => addSection("youtube")}
              >
                <Youtube className="h-5 w-5" />
              </Button>
            </CardContent>
            <CardContent className="flex-row items-center p-4 flex w-full justify-end">
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>{translations("save")}</Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default TimelineTab;
