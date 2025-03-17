"use client";

import { FilePond, FilePondProps, registerPlugin } from "react-filepond";
import { FilePondFile } from "filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { useRef, useState, useEffect } from "react";

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
  ...props
}: FilePondProps & { defaultFiles?: FilePondProps["files"] }) {
  const [files, setFiles] = useState<FilePondProps["files"]>(defaultFiles);
  const fileRef = useRef(null);

  useEffect(() => {
    setFiles(defaultFiles);
  }, [defaultFiles]);

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
        {...props}
      />
    </div>
  );
}
