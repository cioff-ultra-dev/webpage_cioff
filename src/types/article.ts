export type Section = {
  id: string;
  type: "paragraph" | "image" | "video";
  content: string;
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
  countryId: number;
  sections: Section[];
  subPageId?: number;
}
