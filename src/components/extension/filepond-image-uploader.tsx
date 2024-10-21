"use client";

import { FilePond, FilePondProps, registerPlugin } from "react-filepond";
import { FilePondFile } from "filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { useRef, useState } from "react";

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateType,
  FilePondPluginImageCrop,
);

export function FilepondImageUploader({
  defaultFiles = [],
  name = "_image",
  ...props
}: FilePondProps & { defaultFiles?: FilePondProps["files"] }) {
  const [files, setFiles] = useState<FilePondProps["files"]>(defaultFiles);
  const fileRef = useRef(null);

  function handleOnInit() {
    console.log(
      `This is a inicialized componnet for upload file`,
      fileRef.current,
    );
  }

  return (
    <div className="w-full">
      <FilePond
        ref={fileRef}
        files={files}
        server={{
          url: "/api/upload/image",
          headers: {
            "x-custom-field": name,
          },
        }}
        oninit={() => void handleOnInit()}
        name={name}
        onupdatefiles={(values: FilePondFile[]) => {
          setFiles(values.map((item) => item.file as File));
        }}
        {...props}
      />
    </div>
  );
}
