// Document type definition
export type Document = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
};
