import {
  useState,
  forwardRef,
  KeyboardEvent,
  useMemo,
  useCallback,
} from "react";
import { cva } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { TreeNode, TreeSelectProps } from "@/types/tree-select";

import { Option } from "./option";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
export const TreeSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const TreeSelect = forwardRef<HTMLButtonElement, TreeSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      hideSelectedValues = false,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const translations = useTranslations("form");

    const allValues = useMemo(
      () =>
        options.reduce((acc: string[], option: TreeNode) => {
          if (option.children) {
            const items = option.children.map((op) => op.value);

            return [...acc, ...items];
          }

          return [...acc, option.value];
        }, []),
      [options]
    );

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = useCallback(
      (option: string) => {
        const newSelectedValues = selectedValues.includes(option)
          ? selectedValues.filter((value) => value !== option)
          : [...selectedValues, option];
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      },
      [onValueChange, selectedValues]
    );

    const handleClear = useCallback(() => {
      setSelectedValues([]);
      onValueChange([]);
    }, [onValueChange]);

    const handleTogglePopover = useCallback(() => {
      setIsPopoverOpen((prev) => !prev);
    }, []);

    const clearExtraOptions = useCallback(() => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    }, [maxCount, onValueChange, selectedValues]);

    const toggleAll = useCallback(() => {
      if (selectedValues.length === allValues.length) {
        handleClear();
      } else {
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    }, [allValues, handleClear, onValueChange, selectedValues.length]);

    const selectedOptions = useMemo(() => {
      const selectedOptions = selectedValues.slice(0, maxCount).map((value) => {
        const currentSelectedOption = options.find(
          (o) =>
            o.value === value ||
            o.children?.find((option) => option.value === value)
        );
        const option =
          currentSelectedOption?.value === value
            ? currentSelectedOption
            : currentSelectedOption?.children?.find(
                (option) => option.value === value
              );

        const IconComponent = option?.icon;

        return (
          <Badge
            key={value}
            className={cn(
              isAnimating ? "animate-bounce" : "",
              TreeSelectVariants({ variant })
            )}
            title={option?.caption}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
            {option?.label}
            <XCircle
              className="ml-2 h-4 w-4 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                toggleOption(value);
              }}
            />
          </Badge>
        );
      });

      if (selectedValues.length > maxCount)
        selectedOptions.push(
          <Badge
            className={cn(
              "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
              isAnimating ? "animate-bounce" : "",
              TreeSelectVariants({ variant })
            )}
          >
            {`+ ${selectedValues.length - maxCount} more`}
            <XCircle
              className="ml-2 h-4 w-4 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                clearExtraOptions();
              }}
            />
          </Badge>
        );

      return selectedOptions;
    }, [
      clearExtraOptions,
      isAnimating,
      maxCount,
      options,
      selectedValues,
      toggleOption,
      variant,
    ]);

    const renderTree = (nodes: TreeNode[], level = 0) => {
      return nodes.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <Option
            key={option.value}
            isSelected={isSelected}
            level={level}
            toggleOption={toggleOption}
            renderTree={renderTree}
            {...option}
          />
        );
      });
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
              className
            )}
          >
            {selectedValues.length > 0 && !hideSelectedValues ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedOptions}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder={translations("searchPlaceholder")}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>{translations("notResults")}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.length === allValues.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>{translations("selectAll")}</span>
                </CommandItem>
                {renderTree(options)}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        {translations("clear")}
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    {translations("close")}
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

TreeSelect.displayName = "TreeSelect";
