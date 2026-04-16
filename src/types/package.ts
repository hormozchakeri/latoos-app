export type Package = {
  id: string;
  title: string;
  description?: string;
  price?: number;
};

export type GetPackagesResponse = {
  items: Package[];
  totalCount: number;
};