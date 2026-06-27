import { theme } from "@/constants/theme";
import { useMyPackages, useUpdatePackage, useDeletePackage } from "@/features/user-package/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "@/components/Icon";
import React, { useRef, useState, useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPackageScreen() {
  const { packageId, packageName } = useLocalSearchParams<{
    packageId: string;
    packageName: string;
  }>();
  const router = useRouter();

  const { data: packages = [] } = useMyPackages();
  const existing = useMemo(
    () => packages.find((p) => p.id === packageId),
    [packages, packageId]
  );

  const { mutateAsync: updatePackageAsync, isPending: saving } = useUpdatePackage();
  const { mutateAsync: deletePackageAsync, isPending: deleting } = useDeletePackage();

  const nameRef = useRef(existing?.packageName ?? decodeURIComponent(packageName ?? ""));
  const descRef = useRef(existing?.description ?? "");
  const [nameFilled, setNameFilled] = useState(true);
  const [descFilled, setDescFilled] = useState(!!(existing?.description));

  const handleSave = async () => {
    const name = nameRef.current.trim();
    if (!name) { Alert.alert("Package name is required"); return; }
    try {
      await updatePackageAsync({ id: packageId!, packageName: name, description: descRef.current.trim() || undefined });
      router.back();
    } catch {
      Alert.alert("Error", "Could not save changes.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Package",
      `Delete "${nameRef.current.trim() || decodeURIComponent(packageName ?? "")}" and all its vocabularies? This cannot be undone.`,
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
              Alert.alert("Error", "Could not delete package.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          paddingHorizontal: 20, paddingVertical: 16,
          backgroundColor: theme.colors.white,
          borderBottomWidth: 1, borderBottomColor: theme.colors.ink[100],
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.ink[900] }}>
            Edit Package
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.ink[600] }}>
              PACKAGE NAME *
            </Text>
            <TextInput
              defaultValue={existing?.packageName ?? decodeURIComponent(packageName ?? "")}
              onChangeText={(v) => { nameRef.current = v; setNameFilled(v.length > 0); }}
              placeholder="e.g. IELTS Vocabulary Level 1"
              placeholderTextColor={theme.colors.ink[300]}
              autoCorrect={false}
              style={{
                backgroundColor: theme.colors.white, borderRadius: 12,
                paddingHorizontal: 16, paddingVertical: 14,
                fontSize: 15, color: theme.colors.ink[900],
                borderWidth: 1.5,
                borderColor: nameFilled ? theme.colors.primary[400] : theme.colors.ink[200],
              }}
            />
          </View>

          {/* Description */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.ink[600] }}>
              DESCRIPTION (optional)
            </Text>
            <TextInput
              defaultValue={existing?.description ?? ""}
              onChangeText={(v) => { descRef.current = v; setDescFilled(v.length > 0); }}
              placeholder="What will users learn from this package?"
              placeholderTextColor={theme.colors.ink[300]}
              multiline
              numberOfLines={4}
              autoCorrect={false}
              style={{
                backgroundColor: theme.colors.white, borderRadius: 12,
                paddingHorizontal: 16, paddingVertical: 14,
                fontSize: 15, color: theme.colors.ink[900],
                borderWidth: 1.5,
                borderColor: descFilled ? theme.colors.primary[400] : theme.colors.ink[200],
                minHeight: 100, textAlignVertical: "top",
              }}
            />
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View style={{
          padding: 20, gap: 12,
          backgroundColor: theme.colors.white,
          borderTopWidth: 1, borderTopColor: theme.colors.ink[100],
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: nameFilled ? theme.colors.primary[600] : theme.colors.ink[200],
              borderRadius: 14, paddingVertical: 15, alignItems: "center",
              opacity: saving ? 0.7 : 1,
            }}
            onPress={handleSave}
            disabled={saving || !nameFilled}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 14, paddingVertical: 15, alignItems: "center",
              opacity: deleting ? 0.7 : 1,
            }}
            onPress={handleDelete}
            disabled={deleting || saving}
          >
            <Text style={{ color: theme.colors.danger, fontWeight: "700", fontSize: 15 }}>
              {deleting ? "Deleting..." : "Delete Package"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
