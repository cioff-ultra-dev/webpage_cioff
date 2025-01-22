import { PropsWithChildren, ReactNode } from "react";
import Image from "next/image";

interface ListItemProps extends PropsWithChildren {
  handleClick: () => void;
  image?: string;
  rightContent?: ReactNode;
}

export function ListItem(props: ListItemProps) {
  const {
    children,
    image = "/placeholder.svg",
    rightContent,
    handleClick,
  } = props;

  return (
    <div
      className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-200 hover:cursor-pointer"
      onClick={handleClick}
    >
      <div>
        <div className="rounded-lg">
          <Image
            width={60}
            height={60}
            src={image}
            alt="picture-item"
            className="rounded-lg aspect-square"
          />
        </div>
      </div>
      <div className="w-5/6 flex flex-col gap-1">{children}</div>
      <div className="flex-1 flex justify-end">{rightContent}</div>
    </div>
  );
}
