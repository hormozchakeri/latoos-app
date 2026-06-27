import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollPackage, getMyPackages, isEnrolled } from "./api";
import { upsertEnrollment, isEnrolledLocally, getEnrollments } from "@/db/enrollments";
import { upsertVocab } from "@/db/vocabs";
import { useSync } from "@/context/SyncContext";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import api from "@/api/apiClient";
import type { Enrollment, EnrollmentStatus } from "./types";

/** After enrolling, download all vocabs for this package and cache them. */
async function cachePackageVocabs(packageId: string, packageName: string): Promise<void> {
  try {
    const res = await api.get(`/Vocab/All`, {
      params: { packageId, pageNumber: 1, pageSize: 500 },
    });
    const vocabs: any[] = res.data?.items ?? res.data ?? [];
    for (const v of vocabs) {
      await upsertVocab({
        id:              v.id,
        packageId,
        vocabulary:      v.vocabulary,
        type:            v.type ?? "",
        voice:           v.voice ?? "",
        ipaPronunciation: v.ipaPronunciation,
        meaning:         v.meaning,
        example1:        v.example1,
        example2:        v.example2,
        example3:        v.example3,
        synonyms:        v.synonyms,
        antonyms:        v.antonyms,
        wordFamily:      v.wordFamily,
        synced:          true,
      });
    }
    await upsertEnrollment({
      packageId,
      packageName,
      enrolledAt: new Date().toISOString(),
      status: "Active",
    });
  } catch {
    // non-fatal
  }
}

function useCurrentUserId(): string | null {
  const { userToken } = useAuth();
  if (!userToken) return null;
  try {
    const decoded = jwtDecode<{ sub: string }>(userToken);
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

const ENROLLMENT_STATUS_MAP: Record<string | number, EnrollmentStatus> = {
  0: "Active",
  1: "Expired",
  2: "Cancelled",
  Active: "Active",
  Expired: "Expired",
  Cancelled: "Cancelled",
};

function normalizeStatus(raw: string | number): EnrollmentStatus {
  return ENROLLMENT_STATUS_MAP[raw] ?? "Active";
}

export const useEnrolledPackages = () => {
  const { isOnline } = useSync();
  const userId = useCurrentUserId();

  return useQuery({
    queryKey: ["enrolled-packages", userId],
    staleTime: 0,
    enabled: !!userId,
    queryFn: async (): Promise<Enrollment[]> => {
      if (isOnline) {
        try {
          const remote = await getMyPackages();
          // Cache each enrollment locally
          for (const pkg of remote) {
            await upsertEnrollment({
              packageId:   pkg.packageId,
              packageName: pkg.packageName,
              enrolledAt:  pkg.enrolledAt,
              status:      normalizeStatus(pkg.status as any),
            });
          }
          return remote.map((pkg) => ({
            ...pkg,
            status: normalizeStatus(pkg.status as any),
          }));
        } catch {
          // fall through to local
        }
      }
      // Offline fallback
      const local = await getEnrollments();
      return local.map((e) => ({
        id:              e.packageId,
        packageId:       e.packageId,
        packageName:     e.packageName,
        enrolledAt:      e.enrolledAt,
        status:          normalizeStatus(e.status),
        totalCards:      0,
        reviewedCards:   0,
        progressPercent: 0,
      }));
    },
  });
};

/** @deprecated use useEnrolledPackages */
export const useMyPackages = useEnrolledPackages;

export const useIsEnrolled = (packageId: string) => {
  const { isOnline } = useSync();
  return useQuery({
    queryKey: ["is-enrolled", packageId],
    queryFn: async () => {
      if (isOnline) {
        return isEnrolled(packageId);
      }
      const local = await isEnrolledLocally(packageId);
      return { isEnrolled: local };
    },
    enabled: !!packageId,
  });
};

export const useEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageId: string) => {
      const result = await enrollPackage(packageId);
      await cachePackageVocabs(packageId, result.packageName ?? "");
      return result;
    },
    onSuccess: (_, packageId) => {
      queryClient.invalidateQueries({ queryKey: ["is-enrolled", packageId] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-packages"] });
      queryClient.invalidateQueries({ queryKey: ["daily-session"] });
    },
  });
};
