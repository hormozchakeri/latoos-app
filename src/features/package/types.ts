

export type Package = {
  id: string;
  packageName: string;
  description?: string;
  price?: number;
  producer?: string;
  rate?: number;
  rateCount?: number;
};

export type GetPackagesResponse = {
  items: Package[];
  totalCount: number;
};

export type RootStackParamList = {
  PackageDetails: { pkg: Package };
};