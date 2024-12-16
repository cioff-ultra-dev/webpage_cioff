"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FilePondFile,
  FilePondErrorDescription,
  FilePondInitialFile,
} from "filepond";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
import {
  Pilcrow,
  ImageIcon,
  VideoIcon,
  GalleryHorizontal,
  Newspaper,
  Youtube,
  Trash2,
  SquareMinus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FilepondImageUploader } from "@/components/extension/filepond-image-uploader";
import { Editor } from "@/components/common/editor";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CountrySelect } from "@/components/common/country-select";
import { Input } from "@/components/ui/input";
import { SelectCountries } from "@/db/schema";
import {
  Section,
  SelectedSubPage,
  ArticleBody,
  ButtonContent,
} from "@/types/article";
import { Card, CardContent } from "@/components/ui/card";
import VariantSelector from "./variant-selector";

type EditableArticleTemplateProps = {
  initialContent?: SelectedSubPage;
  onSave: (content: ArticleBody) => Promise<void>;
  currentUser?: {
    id: string;
    name: string;
    image?: string;
  };
  onExit?: () => void;
  countries: SelectCountries[];
  localeId: number;
};

export const formSubPageSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  originalDate: z.string(),
  country: z.string(),
  isNews: z.boolean().optional(),
  url: z.string(),
});

const EditableArticleTemplate: React.FC<EditableArticleTemplateProps> = ({
  initialContent,
  onSave,
  currentUser,
  onExit,
  countries,
  localeId,
}) => {
  const [mainImage, setMainImage] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([
    { id: Date.now().toString(), type: "paragraph", content: "", position: 0 },
  ]);

  const initialValues = useMemo(() => {
    const article = initialContent?.texts?.find(
      (text) => text.lang === localeId
    );

    const initialMainImage: FilePondInitialFile[] = initialContent?.mainImage
      ? [
          {
            source: initialContent?.mainImage,
            options: {
              type: "local",
            },
          },
        ]
      : [];

    if (article?.sections && article?.sections?.length > 0) {
      const sections = article?.sections?.sort(
        (a: Section, b: Section) =>
          (a?.position ?? a.id) - (b?.position ?? b.id)
      ) as Section[];

      setSections(sections);
    }

    return {
      title: article?.title,
      subtitle: article?.subtitle ?? "",
      url: initialContent?.url?.split("article/")[1],
      isNews: initialContent?.isNews,
      originalDate: initialContent?.originalDate?.toISOString()?.split("T")[0],
      country: String(initialContent?.countryId || ""),
      mainImage: initialMainImage,
    };
  }, [initialContent, localeId]);

  const form = useForm<z.infer<typeof formSubPageSchema>>({
    resolver: zodResolver(formSubPageSchema),
    defaultValues: {
      title: initialValues.title ?? "",
      subtitle: initialValues.subtitle ?? "",
      url: initialValues.url ?? "",
      isNews: initialValues.isNews ?? false,
      originalDate: initialValues.originalDate ?? "",
      country: initialValues?.country ?? "",
    },
  });
  const formValues = form.watch();

  const translations = useTranslations("news.form");

  const handleSaveClick = async (values: z.infer<typeof formSubPageSchema>) => {
    try {
      const contentToSave = {
        countryId: +values.country,
        url: window.location.origin.concat(
          values.isNews ? "/news/" : "/",
          values.url.toLowerCase().replaceAll(" ", "-")
        ),
        isNews: values.isNews ?? false,
        originalDate: new Date(values.originalDate),
        title: values.title,
        subtitle: values.subtitle,
        mainImage,
        sections: sections.map((section, index) => {
          if (section.type !== "image") return { ...section, position: index };

          const splitUrls =
            typeof section.content === "string"
              ? section.content.split(",")
              : [];

          return {
            ...section,
            content: splitUrls
              .filter((item, index) => splitUrls.indexOf(item) === index)
              .join(","),
            position: index,
          };
        }),
      };

      await onSave(contentToSave);

      toast.success("El artículo guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el artículo:", error);

      toast.error("El artículo no se ha podido guardar.");
    }

    onExit && onExit();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  const addSection = (type: Section["type"]) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      content:
        type === "button"
          ? {
              buttonLabel: "",
              openNewTab: false,
              url: "",
              variant: "default",
            }
          : "",
      position: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = useCallback(
    (id: string, content: string | ButtonContent) => {
      setSections((sections) =>
        sections.map((section) =>
          section.id === id ? { ...section, content } : section
        )
      );
    },
    []
  );

  const removeSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const onProcessFile = useCallback(
    (section: Section) =>
      (error: FilePondErrorDescription | null, file: FilePondFile) => {
        if (error) {
          console.error(error);
          return;
        }

        updateSection(
          section.id,
          typeof section.content === "string" && section.content.length > 0
            ? section.content.concat(",", file.serverId)
            : file.serverId
        );
      },
    [updateSection]
  );

  const onChangeButton = useCallback(
    (section: Section) =>
      (property: keyof ButtonContent, value: string | boolean) => {
        const updatedContent = {
          ...(section.content as ButtonContent),
          [property]: value,
        };

        updateSection(section.id, updatedContent);
      },
    [updateSection]
  );

  const onLoadMainImage = useCallback(
    (error: FilePondErrorDescription | null, file: FilePondFile) => {
      if (error) {
        console.error(error);
        return;
      }

      setMainImage(file.serverId);
    },
    []
  );

  const renderSection = (section: Section) => {
    if (section.type === "paragraph") {
      return (
        <Editor
          className="border p-2 rounded [&>div>p]:min-h-12 editor"
          content={typeof section.content === "string" ? section.content : ""}
          onContentChange={(content: string) =>
            updateSection(section.id, content)
          }
        />
      );
    }

    if (section.type === "image" || section.type === "video") {
      const callback = onProcessFile(section);
      const isImage = section.type === "image";
      const props = {
        acceptedFileTypes: [isImage ? "image/*" : "video/mp4"],
        id: isImage ? "photos" : "videos",
        name: isImage ? "photos" : "videos",
      };

      const initialFiles: FilePondInitialFile[] =
        Object.keys(initialValues).length > 0 &&
        typeof section.content === "string" &&
        section.content.length > 0
          ? section.content.split(",").map((source) => ({
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

    if (section.type === "carousel" || section.type === "news")
      return (
        <div className="w-full h-10 bg-gray-200 rounded-xl flex justify-center items-center font-bold">
          {translations(
            section.type === "carousel"
              ? "sections.carouselContent"
              : "sections.latestNewsContent"
          )}
        </div>
      );

    if (section.type === "youtube")
      return (
        <div className="mb-4 px-1">
          <label className="text-sm font-medium">Youtube url</label>
          <Input
            placeholder={translations("sections.youtubePlaceholder")}
            value={section.content as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateSection(section.id, e.target.value)
            }
            className="focus-visible:ring-0  mt-2"
          />
        </div>
      );
    if (section.type === "button") {
      const buttonInfo = section.content as ButtonContent;
      const callback = onChangeButton(section);

      return (
        <div className="mb-4 px-1 grid grid-cols-1 gap-y-3">
          <div>
            <label className="text-sm font-medium">
              {translations("sections.buttonTitle")}
            </label>
            <Input
              placeholder={translations("sections.buttonPlaceholder")}
              value={buttonInfo.buttonLabel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                callback("buttonLabel", e.target.value)
              }
              className="focus-visible:ring-0  mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              {translations("sections.buttonUrl")}
            </label>
            <Input
              placeholder="https://www.youtube.com/watch?v=example"
              value={buttonInfo.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                callback("url", e.target.value)
              }
              className="focus-visible:ring-0  mt-2"
            />
          </div>
          <div className="grid grid-cols-4">
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm font-medium">
                {translations("sections.openLink")}
              </label>
              <Input
                type="checkbox"
                className="h-5 w-5"
                value={String(buttonInfo.openNewTab)}
                checked={buttonInfo.openNewTab}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  callback("openNewTab", e.target.checked)
                }
              />
            </div>
            <div className="col-span-3 grid grid-cols-1 gap-3">
              <label className="text-sm font-medium">
                {translations("sections.variant")}
              </label>
              <VariantSelector buttonInfo={buttonInfo} callback={callback} />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full p-4 md:p-6 ">
      <h1 className="text-3xl font-semibold">{translations("subPages")}</h1>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentUser && (
          <div className="flex items-center mb-6">
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src={currentUser.image} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-500">By {currentUser.name}</span>
          </div>
        )}
        <Form {...form}>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{translations("title")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {translations("titleDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{translations("subtitle")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {translations("subtitleDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originalDate"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{translations("originalDate")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    {translations("originalDateDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{translations("country")}</FormLabel>
                  <FormControl className="w-full">
                    <CountrySelect
                      countries={countries}
                      handleChange={field.onChange}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {translations("countryDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isNews"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    <FormDescription>{translations("isNews")}</FormDescription>
                  </FormLabel>
                  <FormControl className="w-full h-10 flex items-center">
                    <div>
                      <Input
                        type="checkbox"
                        className="h-5 w-5"
                        value={String(value)}
                        checked={value}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {translations("isNewsDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Url</FormLabel>
                  <FormControl className="w-full">
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {window.location.origin.concat(
                      formValues.isNews ? "/news/" : "/",
                      field.value.toLowerCase().replaceAll(" ", "-")
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
        <div className="flex flex-col gap-4 my-4">
          <label>{translations("mainImage")}</label>
          <FilepondImageUploader
            maxFiles={1}
            defaultFiles={initialValues.mainImage}
            onprocessfile={onLoadMainImage}
          />
        </div>
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
                        <Button
                          onClick={() => removeSection(section.id)}
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          title={translations("sections.remove")}
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
          </CardContent>
          <CardContent className="flex-row items-center p-4 flex w-full justify-end">
            <div className="flex gap-2">
              {onExit && (
                <Button variant="secondary" onClick={onExit}>
                  {translations("sections.cancel")}
                </Button>
              )}
              <Button onClick={form.handleSubmit(handleSaveClick)}>
                {translations("sections.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditableArticleTemplate;
