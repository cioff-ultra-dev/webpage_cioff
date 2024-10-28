export type Section = {
  id: string;
  type: 'title' | 'subtitle' | 'paragraph' | 'image' | 'list';
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
