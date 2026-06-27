import api from "@/api/apiClient";
import type { Enrollment, IsEnrolledResponse } from "./types";

export const enrollPackage = async (packageId: string): Promise<Enrollment> => {
  const res = await api.post("/Enrollment/enroll", { packageId });
  console.log(res);

  return res.data;
};

export const getMyPackages = async (): Promise<Enrollment[]> => {
  const res = await api.get("/Enrollment/my-packages");
  return res.data;
};

export const isEnrolled = async (
  packageId: string,
): Promise<IsEnrolledResponse> => {
  const res = await api.get(`/Enrollment/is-enrolled/${packageId}`);
  return res.data;
};
