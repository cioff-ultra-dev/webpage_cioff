import { useState, Fragment, useMemo } from "react";
import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CommandItem,
} from "@/components/ui/command";
import { OptionsProps } from "@/types/tree-select";

export function Option({
  isSelected,
  children,
  value,
  level,
  caption,
  icon: Icon,
  label,
  toggleOption,
  renderTree,
}: OptionsProps) {
  const hasChildren = !!children?.length;
  const [isVisible, setIsVisible] = useState(false);

  const childrenComponent = useMemo(() => {
    if (!hasChildren)
      return (
        <div
          className={cn(
            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "opacity-50 [&_svg]:invisible"
          )}
        >
          <CheckIcon className="h-4 w-4" />
        </div>
      );

    return isVisible ? <ChevronUp /> : <ChevronDown />;
  }, [hasChildren, isSelected, isVisible]);

  return (
    <Fragment key={value}>
      <CommandItem
        key={value}
        onSelect={() =>
          hasChildren ? setIsVisible(!isVisible) : toggleOption(value)
        }
        className={`cursor-pointer pl-${level * 5}`}
        title={caption}
      >
        {childrenComponent}
        {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
        <span>{label}</span>
      </CommandItem>
      {hasChildren && isVisible && renderTree(children, level + 1)}
    </Fragment>
  );
}
