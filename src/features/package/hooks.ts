import { useQuery } from "@tanstack/react-query";
import { getPackageById, getPackages } from "./api";

export const usePackages = () => {
  return useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });
};

export const usePackageById = (id: string) => {
  return useQuery({
    queryKey: ["package", id],
    queryFn: () => getPackageById(id),
    enabled: !!id,
  });
};
