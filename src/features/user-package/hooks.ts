import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import {
  deletePackage as dbDeletePackage,
  updatePackage as dbUpdatePackage,
  getMyPackages as getLocalMyPackages,
  upsertPackage
} from "@/db/packages";
import { enqueue } from "@/db/syncQueue";
import {
  deleteVocab as dbDeleteVocab,
  getVocabsByPackage,
  upsertVocab,
} from "@/db/vocabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import type { CreatePackagePayload, CreateVocabPayload } from "./api";
import {
  deletePackage as apiDeletePackage,
  deleteVocab as apiDeleteVocab,
  updatePackage as apiUpdatePackage,
  updateVocab as apiUpdateVocab,
  createPackage,
  createVocab,
  getMyPackages as getRemoteMyPackages,
} from "./api";

/** Safe UUID: falls back to timestamp+random if crypto unavailable. */
function generateId(): string {
  try {
    return uuidv4();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

async function saveLocalPackage(pkg: {
  id: string;
  packageName: string;
  description?: string;
  ownerId?: string;
  synced: boolean;
}): Promise<void> {
  await upsertPackage({ ...pkg, isOwner: true });
}

function useUserId(): string | null {
  const { userToken } = useAuth();
  if (!userToken) return null;
  try {
    const decoded = jwtDecode<{ sub: string }>(userToken);
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export function useMyPackages() {
  const { isOnline } = useSync();
  const userId = useUserId();

  return useQuery({
    queryKey: ["my-packages", userId],
    staleTime: 0,
    queryFn: async () => {
      if (isOnline) {
        try {
          const remote = await getRemoteMyPackages();
          // Cache remote packages locally
          for (const pkg of remote) {
            await upsertPackage({ ...pkg, isOwner: true, synced: true });
          }
          // Merge with ALL locally-owned packages not already in remote result
          const allLocal = userId ? await getLocalMyPackages(userId) : [];
          const remoteIds = new Set(remote.map((p: any) => p.id));
          const localOnly = allLocal.filter((p) => !remoteIds.has(p.id));
          return [...remote, ...localOnly];
        } catch {
          // Fall through to local
        }
      }
      if (!userId) return [];
      return getLocalMyPackages(userId);
    },
    enabled: !!userId,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  const { isOnline, triggerSync } = useSync();
  const userId = useUserId();

  return useMutation({
    mutationFn: async (payload: CreatePackagePayload) => {
      const id = generateId();
      const localResult = {
        id,
        packageName: payload.packageName,
        description: payload.description,
        isOwner: true,
      };

      // Always write locally first — this NEVER fails to the user
      await saveLocalPackage({
        id,
        ...payload,
        ownerId: userId ?? undefined,
        synced: false,
      });

      // Try API in background; queue if it fails or we're offline
      if (isOnline) {
        createPackage({ ...payload, id })
          .then(() =>
            saveLocalPackage({
              id,
              ...payload,
              ownerId: userId ?? undefined,
              synced: true,
            }).catch(() => {}),
          )
          .catch(() =>
            enqueue("CREATE_PACKAGE", {
              id,
              packageName: payload.packageName,
              description: payload.description,
            }).catch(() => {}),
          );
      } else {
        enqueue("CREATE_PACKAGE", {
          id,
          packageName: payload.packageName,
          description: payload.description,
        }).catch(() => {});
      }

      return localResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
      if (isOnline) triggerSync();
    },
  });
}

export function usePackageVocabs(packageId: string) {
  return useQuery({
    queryKey: ["package-vocabs", packageId],
    queryFn: () => getVocabsByPackage(packageId),
    enabled: !!packageId,
  });
}

export function useCreateVocab() {
  const { isOnline, triggerSync } = useSync();

  return useMutation({
    mutationFn: async (payload: CreateVocabPayload & { id?: string }) => {
      const id = payload.id ?? generateId();
      const vocabData = {
        id,
        packageId: payload.packageId,
        vocabulary: payload.vocabulary,
        type: payload.type ?? "",
        voice: payload.voice ?? "",
        ipaPronunciation: payload.ipaPronunciation,
        meaning: payload.meaning,
        example1: payload.example1,
        example2: payload.example2,
        example3: payload.example3,
        synonyms: payload.synonyms,
        antonyms: payload.antonyms,
        wordFamily: payload.wordFamily,
      };

      // Always write locally first — never throws to user
      await upsertVocab({ ...vocabData, synced: false });

      // Try API in background; queue if it fails or offline
      if (isOnline) {
        createVocab({ ...vocabData })
          .then(() =>
            upsertVocab({ ...vocabData, synced: true }).catch(() => {}),
          )
          .catch(() => enqueue("CREATE_VOCAB", vocabData).catch(() => {}));
      } else {
        enqueue("CREATE_VOCAB", vocabData).catch(() => {});
      }
    },
    onSuccess: () => {
      if (isOnline) triggerSync();
    },
  });
}

export function useUpdateVocab() {
  const queryClient = useQueryClient();
  const { isOnline, triggerSync } = useSync();

  return useMutation({
    mutationFn: async (payload: CreateVocabPayload & { id: string }) => {
      const vocabData = {
        id: payload.id,
        packageId: payload.packageId,
        vocabulary: payload.vocabulary,
        type: payload.type ?? "",
        voice: payload.voice ?? "",
        ipaPronunciation: payload.ipaPronunciation,
        meaning: payload.meaning,
        example1: payload.example1,
        example2: payload.example2,
        example3: payload.example3,
        synonyms: payload.synonyms,
        antonyms: payload.antonyms,
        wordFamily: payload.wordFamily,
      };
      await upsertVocab({ ...vocabData, synced: false });

      if (isOnline) {
        apiUpdateVocab(payload.id, vocabData)
          .then(() =>
            upsertVocab({ ...vocabData, synced: true }).catch(() => {}),
          )
          .catch(() =>
            enqueue("UPDATE_VOCAB", vocabData).catch((er) => {
              console.log("errrr", er);
            }),
          );
      } else {
        enqueue("UPDATE_VOCAB", vocabData).catch(() => {});
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["package-vocabs", payload.packageId],
      });
      if (isOnline) triggerSync();
    },
  });
}

export function useDeleteVocab() {
  const queryClient = useQueryClient();
  const { isOnline, triggerSync } = useSync();

  return useMutation({
    mutationFn: async ({
      id,
      packageId,
    }: {
      id: string;
      packageId: string;
    }) => {
      await dbDeleteVocab(id);
      if (isOnline) {
        apiDeleteVocab(id).catch(() =>
          enqueue("DELETE_VOCAB", { id }).catch(() => {}),
        );
      } else {
        enqueue("DELETE_VOCAB", { id }).catch(() => {});
      }
      return { packageId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["package-vocabs", result.packageId],
      });
      if (isOnline) triggerSync();
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  const { isOnline, triggerSync } = useSync();

  return useMutation({
    mutationFn: async ({
      id,
      packageName,
      description,
    }: {
      id: string;
      packageName: string;
      description?: string;
    }) => {
      await dbUpdatePackage(id, packageName, description);
      if (isOnline) {
        apiUpdatePackage(id, packageName, description).catch(() =>
          enqueue("UPDATE_PACKAGE", { id, packageName, description }).catch(
            () => {},
          ),
        );
      } else {
        enqueue("UPDATE_PACKAGE", { id, packageName, description }).catch(
          () => {},
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
      if (isOnline) triggerSync();
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  const { isOnline, triggerSync } = useSync();

  return useMutation({
    mutationFn: async (id: string) => {
      await dbDeletePackage(id);
      if (isOnline) {
        apiDeletePackage(id).catch(() =>
          enqueue("DELETE_PACKAGE", { id }).catch(() => {}),
        );
      } else {
        enqueue("DELETE_PACKAGE", { id }).catch(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
      if (isOnline) triggerSync();
    },
  });
}
