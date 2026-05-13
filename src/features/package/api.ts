import api from "@/api/apiClient";
import { GetPackagesResponse, Package } from "./types";

export const getPackages = async (): Promise<GetPackagesResponse> => {
  const res = await api.get("/Package/All", {
    params: {
      PageNumber: 1,
      PageSize: 10,
      Paging: true,
    },
  });
  return res.data;
};

export const getPackageById = async (id: string): Promise<Package> => {
  const res = await api.get("/Package/ById", {
    params: { id },
  });
  return res.data;
};
