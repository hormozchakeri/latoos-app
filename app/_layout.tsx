import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";

function RootLayoutNav() {
  const { userToken, loading } = useAuth();
  const colorScheme = useColorScheme();

  // const [loaded] = useFonts({
  //   SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  // });
  console.log("userToken : ", userToken);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }
  // console.log("userTokloadeden : ", loaded);
  console.log("loading : ", loading);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 👇 Auth stack */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* 👇 App stack */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="+not-found" />
      </Stack>

      {/* ✅ THIS is where redirect should happen */}
      {!userToken ? (
        <Redirect href="/(auth)/SignIn" />
      ) : (
        <Redirect href="/(tabs)" />
      )}

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const queryClient = new QueryClient();
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
