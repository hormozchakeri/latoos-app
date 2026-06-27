import { theme } from "@/constants/theme";
import { usePackageVocabs, useDeleteVocab, useDeletePackage } from "@/features/user-package/hooks";
import type { LocalVocab } from "@/db/vocabs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "@/components/Icon";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function VocabRow({ item, onEdit, onDelete }: { item: LocalVocab; onEdit: () => void; onDelete: () => void }) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.ink[900] }}>
          {item.vocabulary}
        </Text>
        {item.meaning ? (
          <Text style={{ fontSize: 13, color: theme.colors.ink[400], marginTop: 2 }} numberOfLines={1}>
            {item.meaning}
          </Text>
        ) : item.ipaPronunciation ? (
          <Text style={{ fontSize: 13, color: theme.colors.ink[400], marginTop: 2 }} numberOfLines={1}>
            {item.ipaPronunciation}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onEdit}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          backgroundColor: theme.colors.primary[50],
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 7,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.primary[600] }}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          backgroundColor: "#FEE2E2",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 7,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.danger }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PackageVocabListScreen() {
  const { packageId, packageName } = useLocalSearchParams<{
    packageId: string;
    packageName: string;
  }>();
  const router = useRouter();
  const decodedName = decodeURIComponent(packageName ?? "");

  const { data: vocabs = [], isLoading } = usePackageVocabs(packageId!);
  const { mutateAsync: deleteVocabAsync, isPending: deletingVocab } = useDeleteVocab();
  const { mutateAsync: deletePackageAsync, isPending: deletingPackage } = useDeletePackage();

  const handleDeleteVocab = (item: LocalVocab) => {
    Alert.alert(
      "Delete Vocab",
      `Delete "${item.vocabulary}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVocabAsync({ id: item.id, packageId: packageId! });
            } catch {
              Alert.alert("Error", "Could not delete vocabulary. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleDeletePackage = () => {
    Alert.alert(
      "Delete Package",
      `Delete "${decodedName}" and all its vocabularies? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePackageAsync(packageId!);
              router.back();
            } catch {
              Alert.alert("Error", "Could not delete package. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.ink[100],
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: theme.colors.ink[100],
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} color={theme.colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.ink[900] }} numberOfLines={1}>
              {decodedName}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.ink[400] }}>
              {vocabs.length} {vocabs.length === 1 ? "word" : "words"}
            </Text>
          </View>

          {/* Edit Package */}
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/edit-package?packageId=${packageId}&packageName=${encodeURIComponent(decodedName)}`
              )
            }
            style={{
              backgroundColor: theme.colors.primary[50],
              borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.primary[600] }}>Edit</Text>
          </TouchableOpacity>

          {/* Delete Package */}
          <TouchableOpacity
            onPress={handleDeletePackage}
            disabled={deletingPackage}
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.danger }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={vocabs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.ink[700] }}>
                No vocabularies yet
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.ink[400], textAlign: "center" }}>
                Tap "+ Add Vocab" below to add your first word.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <VocabRow
              item={item}
              onEdit={() =>
                router.push(
                  `/edit-vocab?vocabId=${item.id}&packageId=${packageId}&packageName=${encodeURIComponent(decodedName)}`
                )
              }
              onDelete={() => handleDeleteVocab(item)}
            />
          )}
        />
      )}

      {/* Add Vocab FAB */}
      <View
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: 16,
          backgroundColor: theme.colors.white,
          borderTopWidth: 1, borderTopColor: theme.colors.ink[100],
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary[600],
            borderRadius: 14, paddingVertical: 15, alignItems: "center",
          }}
          onPress={() =>
            router.push(
              `/add-vocab?packageId=${packageId}&packageName=${encodeURIComponent(decodedName)}`
            )
          }
        >
          <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
            + Add Vocabulary
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
