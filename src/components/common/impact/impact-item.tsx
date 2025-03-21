import { JSX } from "react";
import Image from "next/image";

interface ImpactItemProps {
  image: string;
  description: string;
  altImage: string;
}

export function ImpactItem({
  description,
  image,
  altImage,
}: ImpactItemProps): JSX.Element {
  return (
    <div className="flex flex-col items-center px-2">
      <Image src={image} alt={altImage} width={80} height={80} />
      <p
        className="text-lg font-medium text-center text-secular mt-4"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}
