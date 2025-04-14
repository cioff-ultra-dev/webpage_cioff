export type ButtonContent = {
  buttonLabel: string;
  url: string;
  openNewTab: boolean;
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
};

export type BannerContent = {
  image: string;
  title: string;
  description: string;
  justify: "center" | "left" | "right";
};

export type Section = {
  id: string;
  type:
    | "paragraph"
    | "image"
    | "video"
    | "carousel"
    | "news"
    | "youtube"
    | "button"
    | "banner";
  content: ButtonContent | string | BannerContent;
  position: number;
};

export type Article = {
  id: string;
  title: string;
  sections: Section[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface SelectedSubPage {
  id: number;
  slug: string;
  originalDate: Date;
  published: boolean;
  url: string;
  countryId: number;
  isNews: boolean;
  mainImage: string;
  texts: Array<{
    sections?: Section[];
    lang: number;
    subtitle: string;
    title: string;
  }>;
  country: {
    id: number;
    slug: string;
  };
}

export interface ArticleBody {
  isNews: boolean;
  originalDate: Date;
  title: string;
  subtitle: string;
  url: string;
  countryId?: number;
  sections: Section[];
  subPageId?: number;
  mainImage: string;
}
