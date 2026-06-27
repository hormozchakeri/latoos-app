import { theme } from "@/constants/theme";
import { useMyPackages } from "@/features/user-package/hooks";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "@/components/Icon";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPackagesScreen() {
  const router = useRouter();
  const { data: packages, isLoading } = useMyPackages();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: theme.colors.white,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.ink[100],
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.ink[900] }}>
          My Packages
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/create-package")}
          style={{
            backgroundColor: theme.colors.primary[600],
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 13 }}>+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      ) : !packages || packages.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 }}>
          <Text style={{ fontSize: 48 }}>📦</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.ink[800], textAlign: "center" }}>
            No packages yet
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.ink[400], textAlign: "center" }}>
            Create your first vocabulary package to start building your own word sets.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary[600],
              borderRadius: 14,
              paddingHorizontal: 28,
              paddingVertical: 14,
              marginTop: 8,
            }}
            onPress={() => router.push("/create-package")}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
              Create Package
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 16,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() =>
                router.push(`/package-vocab-list?packageId=${item.id}&packageName=${encodeURIComponent(item.packageName)}`)
              }
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary[100],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 22 }}>📚</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.ink[900] }}>
                  {item.packageName}
                </Text>
                {item.description ? (
                  <Text
                    style={{ fontSize: 13, color: theme.colors.ink[400], marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <ChevronRight size={20} color={theme.colors.ink[300]} strokeWidth={2} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
