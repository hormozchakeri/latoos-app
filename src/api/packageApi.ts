import { GetPackagesResponse } from "@/types/package";

export type Package = {
  id: string;
  title: string;
  description?: string;
  price?: number;
};

export type GetPackagesParams = {
  pageNumber?: number;
  pageSize?: number;
  paging?: boolean;
};


export async function getPackages(
  params?: GetPackagesParams
): Promise<GetPackagesResponse> {
  const query = new URLSearchParams();

  if (params?.pageNumber)
    query.append("PageNumber", params.pageNumber.toString());

  if (params?.pageSize)
    query.append("PageSize", params.pageSize.toString());

  if (params?.paging !== undefined)
    query.append("Paging", params.paging.toString());

  const url = `http://10.0.2.2:5171/api/Package/All?${query.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch packages");
  }

  const data = await response.json();

  console.log("PACKAGES:", data);

  return data;
}