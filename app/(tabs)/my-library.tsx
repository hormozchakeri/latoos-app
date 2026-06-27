import { theme } from "@/constants/theme";
import { useEnrolledPackages } from "@/features/enrollment/hooks";
import type { Enrollment } from "@/features/enrollment/types";
import { useMyPackages as useOwnedPackages } from "@/features/user-package/hooks";
import type { LocalPackage } from "@/db/packages";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ProgressRing({ percent }: { percent: number }) {
  const color =
    percent >= 80
      ? theme.colors.success
      : percent >= 40
      ? theme.colors.warning
      : theme.colors.primary[500];

  return (
    <View
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: color,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.white,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "800", color }}>
        {percent}%
      </Text>
    </View>
  );
}

function EnrolledCard({ item }: { item: Enrollment }) {
  const router = useRouter();
  const dest = `/practice-session?packageId=${item.packageId}&packageName=${encodeURIComponent(item.packageName)}`;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      activeOpacity={0.85}
      onPress={() => router.push(dest)}
    >
      <ProgressRing percent={item.progressPercent ?? 0} />

      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.ink[900] }} numberOfLines={1}>
          {item.packageName}
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.ink[500] }}>
          {item.reviewedCards ?? 0} / {item.totalCards ?? 0} cards reviewed
        </Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "rgba(247,110,43,0.12)",
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
        onPress={() => router.push(dest)}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>
          Practice
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function OwnedCard({ item }: { item: LocalPackage }) {
  const router = useRouter();
  const vocabListUrl = `/package-vocab-list?packageId=${item.id}&packageName=${encodeURIComponent(item.packageName)}`;
  const practiceUrl = `/practice-session?packageId=${item.id}&packageName=${encodeURIComponent(item.packageName)}`;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      activeOpacity={0.85}
      onPress={() => router.push(vocabListUrl)}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          backgroundColor: theme.colors.primary[100],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22 }}>📚</Text>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.ink[900] }} numberOfLines={1}>
          {item.packageName}
        </Text>
        {item.description ? (
          <Text style={{ fontSize: 12, color: theme.colors.ink[400] }} numberOfLines={1}>
            {item.description}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: theme.colors.ink[400] }}>My package</Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.ink[100],
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
          onPress={() => router.push(vocabListUrl)}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.ink[600] }}>
            Manage
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "rgba(247,110,43,0.12)",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
          onPress={() => router.push(practiceUrl)}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>
            Practice
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.ink[900] }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.primary[600] }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MyLibraryScreen() {
  const router = useRouter();
  const {
    data: enrolled = [],
    isLoading: loadingEnrolled,
    refetch: refetchEnrolled,
  } = useEnrolledPackages();
  const {
    data: owned = [],
    isLoading: loadingOwned,
    refetch: refetchOwned,
  } = useOwnedPackages();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchEnrolled(), refetchOwned()]);
    setRefreshing(false);
  };

  const isLoading = loadingEnrolled || loadingOwned;
  const totalPackages = enrolled.length + owned.length;
  const completedCount = enrolled.filter((p) => (p.progressPercent ?? 0) >= 100).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.white}
          />
        }
      >
        {/* Hero */}
        <View style={{ backgroundColor: theme.colors.hero, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.white }}>
              My Library
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
              onPress={() => router.push("/create-package")}
            >
              <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 13 }}>+ Create</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 16,
              marginTop: 20,
              flexDirection: "row",
              gap: 24,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.white }}>{totalPackages}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Packages</Text>
            </View>
            <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.white }}>{owned.length}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Created</Text>
            </View>
            <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.white }}>{completedCount}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View
          style={{
            backgroundColor: theme.colors.ink[50],
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            marginTop: -24,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 120,
            minHeight: 400,
          }}
        >
          {isLoading && (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
          )}

          {/* My Creations section */}
          {!isLoading && owned.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <SectionHeader
                title="My Creations"
                action="+ New"
                onAction={() => router.push("/create-package")}
              />
              {owned.map((item) => (
                <OwnedCard key={item.id} item={item} />
              ))}
            </View>
          )}

          {/* Enrolled Packages section */}
          {!isLoading && enrolled.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <SectionHeader
                title="Enrolled Packages"
                action="Browse"
                onAction={() => router.push("/(tabs)/explore")}
              />
              {enrolled.map((item) => (
                <EnrolledCard key={item.id} item={item} />
              ))}
            </View>
          )}

          {/* Empty state */}
          {!isLoading && totalPackages === 0 && (
            <View style={{ alignItems: "center", paddingTop: 40, gap: 14 }}>
              <Text style={{ fontSize: 48 }}>📦</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.ink[800], textAlign: "center" }}>
                Your library is empty
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.ink[400], textAlign: "center" }}>
                Create your own package or browse to enroll in an existing one.
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.primary[600],
                    borderRadius: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                  }}
                  onPress={() => router.push("/create-package")}
                >
                  <Text style={{ color: theme.colors.white, fontWeight: "700" }}>Create Package</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.ink[200],
                    borderRadius: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                  }}
                  onPress={() => router.push("/(tabs)/explore")}
                >
                  <Text style={{ color: theme.colors.ink[700], fontWeight: "700" }}>Browse</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
