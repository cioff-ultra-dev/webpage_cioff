import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

import { CouncilItem, CouncilItemProps } from "./council-item";

interface CouncilSectorProps {
  title: string;
  councils: CouncilItemProps[];
  classes?: string;
}

export function CouncilSector(props: CouncilSectorProps) {
  const { title, councils, classes } = props;

  const items = useMemo(
    () => councils.map((council, i) => <CouncilItem key={i} {...council} />),
    [councils]
  );

  return (
    <section className={twMerge("flex flex-col items-center", classes)}>
      <h1 className="bg-primary text-white font-medium font-secular uppercase text-2xl px-2 py-1 rounded-xl w-fit text-center max-md:text-lg">
        {title}
      </h1>
      <div className="grid grid-cols-3 gap-6 h-auto max-md:grid-cols-1 max-lg:grid-cols-2">
        {items}
      </div>
    </section>
  );
}
