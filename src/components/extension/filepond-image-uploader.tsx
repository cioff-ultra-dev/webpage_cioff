"use client";

import { useRef, useState } from "react";
import { FilePond, FilePondProps, registerPlugin } from "react-filepond";
import { FilePondErrorDescription, FilePondFile } from "filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateType,
  FilePondPluginImageCrop,
  FilePondPluginFileValidateSize
);

export function FilepondImageUploader({
  defaultFiles = [],
  name = "_image",
  onremovefile,
  ...props
}: FilePondProps & { defaultFiles?: FilePondProps["files"] }) {
  const [files, setFiles] = useState<FilePondProps["files"]>(defaultFiles);
  const fileRef = useRef(null);

  const onRemoveCoverImages = (
    error: FilePondErrorDescription | null,
    file: FilePondFile
  ) => {
    if (error) {
      console.error(error);

      return;
    }

    setFiles(files?.filter((cover: any) => cover?.name !== file.filename));
    onremovefile?.(error, file);
  };

  return (
    <div className="w-full">
      <FilePond
        ref={fileRef}
        maxFileSize="20MB"
        files={files}
        server={{
          url: "/api/upload/image",
          headers: {
            "x-custom-field": name,
          },
        }}
        name={name}
        onupdatefiles={(values: FilePondFile[]) => {
          setFiles(values.map((item) => item.file as File));
        }}
        onremovefile={onRemoveCoverImages}
        {...props}
      />
    </div>
  );
}
