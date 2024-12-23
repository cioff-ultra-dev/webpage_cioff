export type TabOptions =
  | "banner"
  | "menu"
  | "social-networks"
  | "categories"
  | "timeline";

export interface MenuItem {
  id?: string;
  slug: string;
  name: string;
  order: number;
}

export interface SelectedMenu {
  id?: number;
  slug: string;
  order: number;
}

export interface SelectedMenuLang {
  id?: number;
  menuId?: number;
  name: string;
  menu: SelectedMenu;
}

export type TimelineSection = {
  id: string;
  type: "image" | "video" | "youtube";
  url: string;
  description: string;
  position: number;
};