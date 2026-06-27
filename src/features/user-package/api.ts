import api from "@/api/apiClient";

export interface UserPackage {
  id: string;
  packageName: string;
  description?: string;
  ownerId?: string;
  isOwner: boolean;
}

export interface CreatePackagePayload {
  id?: string;
  packageName: string;
  description?: string;
}

export interface CreateVocabPayload {
  id?: string;
  packageId: string;
  vocabulary: string;
  type: string;
  voice: string;
  ipaPronunciation?: string;
  meaning?: string;
  example1?: string;
  example2?: string;
  example3?: string;
  synonyms?: string;
  antonyms?: string;
  wordFamily?: string;
}

export async function createPackage(payload: CreatePackagePayload): Promise<UserPackage> {
  const res = await api.post<UserPackage>("/Package", payload);
  return res.data;
}

export async function getMyPackages(): Promise<UserPackage[]> {
  const res = await api.get<UserPackage[]>("/Package/my-packages");
  return res.data;
}

export async function createVocab(payload: CreateVocabPayload): Promise<void> {
  await api.post("/Vocab", payload);
}

export async function updateVocab(id: string, payload: Partial<CreateVocabPayload>): Promise<void> {
  await api.put("/Vocab", { id, ...payload });
}

export async function deleteVocab(id: string): Promise<void> {
  await api.delete(`/Vocab?id=${id}`);
}

export async function updatePackage(id: string, packageName: string, description?: string): Promise<void> {
  await api.put("/Package", { id, packageName, description });
}

export async function deletePackage(id: string): Promise<void> {
  await api.delete(`/Package?id=${id}`);
}
