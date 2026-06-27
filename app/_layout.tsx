import "../global.css";
import "@/i18n";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { queryClient } from "@/store/queryClient";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SyncProvider, useSync } from "@/context/SyncContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getDb } from "@/db/database";
import { theme } from "@/constants/theme";

function SyncBanner() {
  const { isOnline, isSyncing, pendingCount } = useSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: isOnline ? theme.colors.primary[600] : "#374151",
        paddingVertical: 6,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        zIndex: 9999,
      }}
    >
      {!isOnline && (
        <>
          <Text style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>
            Offline
          </Text>
          {pendingCount > 0 && (
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              · {pendingCount} pending
            </Text>
          )}
        </>
      )}
      {isOnline && pendingCount > 0 && (
        <Text style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>
          {isSyncing ? "Syncing..." : `${pendingCount} item${pendingCount > 1 ? "s" : ""} to sync`}
        </Text>
      )}
    </View>
  );
}

function RootLayoutNav() {
  const { userToken, loading } = useAuth();
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    getDb().then(() => setDbReady(true));
  }, []);

  if (loading || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SyncBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="practice-session" options={{ headerShown: false }} />
        <Stack.Screen name="arena" options={{ headerShown: false }} />
        <Stack.Screen name="my-packages" options={{ headerShown: false }} />
        <Stack.Screen name="create-package" options={{ headerShown: false }} />
        <Stack.Screen name="add-vocab" options={{ headerShown: false }} />
        <Stack.Screen name="package-vocab-list" options={{ headerShown: false }} />
        <Stack.Screen name="edit-vocab" options={{ headerShown: false }} />
        <Stack.Screen name="edit-package" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {!userToken ? (
        <Redirect href="/(auth)/SignIn" />
      ) : (
        <Redirect href="/(tabs)" />
      )}

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SyncProvider>
          <RootLayoutNav />
        </SyncProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
