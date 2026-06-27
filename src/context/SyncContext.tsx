import { getPendingCount } from "@/db/syncQueue";
import { processSyncQueue } from "@/sync/syncEngine";
import NetInfo from "@react-native-community/netinfo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type SyncContextType = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  triggerSync: () => Promise<void>;
};

const SyncContext = createContext<SyncContextType>({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  triggerSync: async () => {},
});

export const useSync = () => useContext(SyncContext);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline]       = useState(true);
  const [isSyncing, setIsSyncing]     = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const wasOffline = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await processSyncQueue();
      await refreshPendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  // Monitor network and auto-sync when connection restored
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      if (online && wasOffline.current) {
        // Just came back online — flush the queue
        triggerSync();
      }
      wasOffline.current = !online;
    });

    return unsubscribe;
  }, [triggerSync]);

  // Initial pending count
  useEffect(() => {
    refreshPendingCount();
  }, []);

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingCount, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}
