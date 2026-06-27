import { theme } from "@/constants/theme";
import { useCreatePackage } from "@/features/user-package/hooks";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight } from "@/components/Icon";
import React, { useRef, useState } from "react";
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

export default function CreatePackageScreen() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreatePackage();

  const nameRef = useRef("");
  const descRef = useRef("");
  // Track filled state for border color feedback only
  const [nameFilled, setNameFilled] = useState(false);
  const [descFilled, setDescFilled] = useState(false);

  const handleCreate = () => {
    const name = nameRef.current.trim();
    if (!name) {
      Alert.alert("Package name is required");
      return;
    }
    const description = descRef.current.trim() || undefined;
    create(
      { packageName: name, description },
      {
        onSuccess: (pkg) => {
          router.replace(
            `/add-vocab?packageId=${pkg.id}&packageName=${encodeURIComponent(pkg.packageName)}`
          );
        },
        onError: () => Alert.alert("Error", "Could not save package. Please try again."),
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: theme.colors.white,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.ink[100],
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.ink[900] }}>
            New Package
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.ink[600] }}>
              PACKAGE NAME *
            </Text>
            <TextInput
              defaultValue=""
              onChangeText={(v) => {
                nameRef.current = v;
                setNameFilled(v.length > 0);
              }}
              placeholder="e.g. IELTS Vocabulary Level 1"
              placeholderTextColor={theme.colors.ink[300]}
              autoCorrect={false}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.colors.ink[900],
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
              defaultValue=""
              onChangeText={(v) => {
                descRef.current = v;
                setDescFilled(v.length > 0);
              }}
              placeholder="What will users learn from this package?"
              placeholderTextColor={theme.colors.ink[300]}
              multiline
              numberOfLines={4}
              autoCorrect={false}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.colors.ink[900],
                borderWidth: 1.5,
                borderColor: descFilled ? theme.colors.primary[400] : theme.colors.ink[200],
                minHeight: 100,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Info card */}
          <View
            style={{
              backgroundColor: theme.colors.primary[50],
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 20 }}>💡</Text>
            <Text style={{ flex: 1, fontSize: 13, color: theme.colors.primary[700], lineHeight: 20 }}>
              After creating the package you can add vocabularies with as many fields as you want —
              word, pronunciation, meaning, examples, synonyms, and more.
            </Text>
          </View>
        </ScrollView>

        {/* Create button */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: nameFilled ? theme.colors.primary[600] : theme.colors.ink[200],
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              opacity: isPending ? 0.7 : 1,
            }}
            onPress={handleCreate}
            disabled={isPending || !nameFilled}
          >
            {isPending ? (
              <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>Creating...</Text>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>Create & Add Vocabularies</Text>
                <ArrowRight size={18} color={theme.colors.white} strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
