import api from "@/api/apiClient";
import {
  getPendingItems,
  incrementAttempts,
  removeItem,
} from "@/db/syncQueue";
import { markPackageSynced } from "@/db/packages";
import { markVocabSynced } from "@/db/vocabs";
import { markProgressSynced } from "@/db/practiceProgress";

let _running = false;

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (_running) return { synced: 0, failed: 0 };
  _running = true;

  let synced = 0;
  let failed = 0;

  try {
    const items = await getPendingItems();

    for (const item of items) {
      try {
        switch (item.operation) {
          case "CREATE_PACKAGE":
            await api.post("/Package", item.payload);
            await markPackageSynced(item.payload.id as string);
            break;

          case "CREATE_VOCAB":
            await api.post("/Vocab", item.payload);
            await markVocabSynced(item.payload.id as string);
            break;

          case "RATE_CARD":
            await api.post("/Practice/rate", item.payload);
            if (item.payload.progressId) {
              await markProgressSynced(item.payload.progressId as string);
            }
            break;

          case "ENROLL_PACKAGE":
            await api.post("/Enrollment/enroll", item.payload);
            break;

          case "UPDATE_VOCAB":
            await api.put("/Vocab", { id: item.payload.id, ...item.payload });
            await markVocabSynced(item.payload.id as string);
            break;

          case "DELETE_VOCAB":
            await api.delete(`/Vocab?id=${item.payload.id}`);
            break;

          case "UPDATE_PACKAGE":
            await api.put("/Package", item.payload);
            await markPackageSynced(item.payload.id as string);
            break;

          case "DELETE_PACKAGE":
            await api.delete(`/Package?id=${item.payload.id}`);
            break;
        }

        await removeItem(item.id);
        synced++;
      } catch {
        await incrementAttempts(item.id);
        failed++;
      }
    }
  } finally {
    _running = false;
  }

  return { synced, failed };
}
