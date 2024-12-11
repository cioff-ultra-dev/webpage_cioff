"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FilePondFile, FilePondErrorDescription } from "filepond";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
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
import { Section, SelectedSubPage, ArticleBody } from "@/types/article";

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
}) => {
  const [sections, setSections] = useState<Section[]>([
    { id: Date.now().toString(), type: "paragraph", content: "" },
  ]);

  const router = useRouter();

  const initialValues = useMemo(() => {
    const article = initialContent?.texts?.find(
      (text) => text.lang === initialContent?.country?.id
    );

    article?.sections && setSections(article?.sections);
    return {
      title: article?.title,
      subtitle: article?.subtitle ?? "",
      url: initialContent?.url,
      isNews: initialContent?.published,
      originalDate: initialContent?.originalDate?.toISOString()?.split("T")[0],
    };
  }, [initialContent]);

  const form = useForm<z.infer<typeof formSubPageSchema>>({
    resolver: zodResolver(formSubPageSchema),
    defaultValues: {
      title: initialValues.title ?? "",
      subtitle: initialValues.subtitle ?? "",
      url: initialValues.url ?? "",
      isNews: initialValues.isNews ?? false,
      originalDate: initialValues.originalDate ?? "",
    },
  });

  const t = useTranslations("form.festival");

  const handleSaveClick = async (values: z.infer<typeof formSubPageSchema>) => {
    console.log(values);
    console.log(sections);
    try {
      const contentToSave = {
        countryId: +values.country,
        url: window.location.origin.concat(
          "/article/",
          values.url.toLowerCase().replaceAll(" ", "-")
        ),
        isNews: values.isNews ?? false,
        originalDate: new Date(values.originalDate),
        title: values.title,
        subtitle: values.subtitle,
        sections,
      };

      const response = await onSave(contentToSave);
      console.log(response);
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
      content: "",
    };
    setSections([...sections, newSection]);
  };

  const updateSection = useCallback((id: string, content: string) => {
    setSections((sections) =>
      sections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
  }, []);

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
          section.content.length > 0
            ? section.content.concat(",", file.serverId)
            : file.serverId
        );
      },
    [updateSection]
  );

  const renderSection = (section: Section) => {
    if (section.type === "paragraph") {
      return (
        <Editor
          className="border p-2 rounded [&>div>p]:min-h-12 editor"
          content={section.content}
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

      return (
        <FilepondImageUploader
          allowMultiple
          maxFiles={5}
          defaultFiles={[]}
          onprocessfile={callback}
          {...props}
        />
      );
    }
  };

  return (
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
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>name of the article</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>subtitle of the article</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalDate"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>original date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>date of the article</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Country</FormLabel>
                <FormControl className="w-full">
                  <CountrySelect
                    countries={countries}
                    handleChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Select a country</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isNews"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Is News</FormLabel>
                <FormControl className="w-full h-10 flex items-center">
                  <div>
                    <Input
                      type="checkbox"
                      className="h-5 w-5"
                      value={String(value || false)}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>mark if the article is news.</FormDescription>
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
                    "/article/",
                    field.value.toLowerCase().replaceAll(" ", "-")
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
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
                      >
                        Remove Section
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

      <div className="flex justify-between mt-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button>Add Section</Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="grid gap-4">
              <Button onClick={() => addSection("paragraph")}>
                Add Paragraph
              </Button>
              <Button onClick={() => addSection("image")}>Add Image</Button>
              <Button onClick={() => addSection("video")}>Add Video</Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex gap-6">
          {onExit && (
            <Button variant="secondary" onClick={onExit}>
              Cancel
            </Button>
          )}
          <Button
            onClick={form.handleSubmit(handleSaveClick)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Save Article
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditableArticleTemplate;
