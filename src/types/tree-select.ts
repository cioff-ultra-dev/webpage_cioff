
import { ReactNode } from "react";
import {  type VariantProps } from "class-variance-authority";

import { TreeSelectVariants } from "@/components/common/tree-select/select";

export interface TreeNode {
  /** The text to display for the option. */
  label: string;
  /** The unique value associated with the option. */
  value: string;
  /** Optional caption value for title each badge. */
  caption?: string;
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional children nodes for nested options. */
  children?: TreeNode[];
}

/**
 * Props for TreeSelect component
 */
export interface TreeSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof TreeSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: TreeNode[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  hideSelectedValues?: boolean;

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * allow select all options
   */
  allowSelectAll?: boolean;
}


export interface OptionsProps extends TreeNode {
  level: number;
  isSelected: boolean;
  toggleOption: (option: string) => void;
  renderTree: (nodes: TreeNode[], level: number) => ReactNode[];
}