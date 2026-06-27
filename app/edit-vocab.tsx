import { theme } from "@/constants/theme";
import { usePackageVocabs, useUpdateVocab } from "@/features/user-package/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, X } from "@/components/Icon";
import React, { useRef, useState, useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONAL_FIELDS = [
  { key: "ipaPronunciation", label: "IPA Pronunciation", icon: "🔊", placeholder: "/həˈloʊ/" },
  { key: "meaning",          label: "Meaning / Translation", icon: "📖", placeholder: "سلام" },
  { key: "example1",         label: "Example 1", icon: "💬", placeholder: "She said hello to her teacher." },
  { key: "example2",         label: "Example 2", icon: "💬", placeholder: "Hello! My name is Ali." },
  { key: "example3",         label: "Example 3", icon: "💬", placeholder: "Hello, is anyone there?" },
  { key: "synonyms",         label: "Synonyms", icon: "🔗", placeholder: "hi, hey, greetings" },
  { key: "antonyms",         label: "Antonyms", icon: "↔️", placeholder: "goodbye, farewell" },
  { key: "wordFamily",       label: "Word Family", icon: "🌿", placeholder: "hello (n.), hello (v.)" },
] as const;

type FieldKey = typeof OPTIONAL_FIELDS[number]["key"];

function FieldInput({
  label, icon, placeholder, defaultValue, resetKey, onChangeText, onRemove, multiline, rtl,
}: {
  label: string; icon: string; placeholder: string; defaultValue: string;
  resetKey: number; onChangeText: (v: string) => void; onRemove: () => void;
  multiline?: boolean; rtl?: boolean;
}) {
  const [filled, setFilled] = useState(defaultValue.length > 0);
  return (
    <View style={{
      backgroundColor: theme.colors.white, borderRadius: 14, padding: 14,
      borderWidth: 1.5, borderColor: filled ? theme.colors.primary[300] : theme.colors.ink[200], gap: 8,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.ink[500], letterSpacing: 0.5 }}>
            {label.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={16} color={theme.colors.ink[300]} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <TextInput
        key={`${resetKey}-${label}`}
        defaultValue={defaultValue}
        onChangeText={(v) => { setFilled(v.length > 0); onChangeText(v); }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.ink[300]}
        multiline={multiline}
        autoCorrect={false}
        autoCapitalize="none"
        style={{
          fontSize: 15, color: theme.colors.ink[900],
          minHeight: multiline ? 60 : undefined,
          textAlignVertical: multiline ? "top" : undefined,
          textAlign: rtl ? "right" : "left",
          writingDirection: rtl ? "rtl" : "ltr",
        }}
      />
    </View>
  );
}

function FieldPickerModal({ visible, addedKeys, onAdd, onClose }: {
  visible: boolean; addedKeys: Set<string>; onAdd: (key: FieldKey) => void; onClose: () => void;
}) {
  const available = OPTIONAL_FIELDS.filter((f) => !addedKeys.has(f.key));
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={onClose} />
      <View style={{
        backgroundColor: theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, gap: 8, position: "absolute", bottom: 0, left: 0, right: 0,
      }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.ink[900], marginBottom: 8 }}>
          Add a field
        </Text>
        {available.length === 0 ? (
          <Text style={{ color: theme.colors.ink[400], textAlign: "center", paddingVertical: 20 }}>
            All available fields are already added.
          </Text>
        ) : available.map((field) => (
          <TouchableOpacity
            key={field.key}
            style={{
              flexDirection: "row", alignItems: "center", gap: 12,
              paddingVertical: 14, paddingHorizontal: 16,
              backgroundColor: theme.colors.ink[50], borderRadius: 12,
            }}
            onPress={() => { onAdd(field.key); onClose(); }}
          >
            <Text style={{ fontSize: 20 }}>{field.icon}</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.ink[800] }}>{field.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={{ marginTop: 8, paddingVertical: 14, alignItems: "center" }} onPress={onClose}>
          <Text style={{ color: theme.colors.ink[400], fontSize: 15 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function EditVocabScreen() {
  const { vocabId, packageId, packageName } = useLocalSearchParams<{
    vocabId: string; packageId: string; packageName: string;
  }>();
  const router = useRouter();
  const { mutateAsync: updateVocabAsync, isPending } = useUpdateVocab();

  // Load existing vocab from the package vocab list query cache
  const { data: vocabs = [], isLoading } = usePackageVocabs(packageId!);
  const existing = useMemo(() => vocabs.find((v) => v.id === vocabId), [vocabs, vocabId]);

  // Uncontrolled refs for field values
  const vocabularyRef = useRef(existing?.vocabulary ?? "");
  const fieldValuesRef = useRef<Record<string, string>>({});

  const [vocabFilled, setVocabFilled] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [resetKey] = useState(0);

  // Build initial active fields from existing data
  const initialFields = useMemo<{ key: FieldKey }[]>(() => {
    if (!existing) return [];
    return OPTIONAL_FIELDS
      .filter((f) => !!(existing as any)[f.key])
      .map((f) => ({ key: f.key }));
  }, [existing]);

  const [fields, setFields] = useState<{ key: FieldKey }[]>(initialFields);

  const addedKeys = new Set(fields.map((f) => f.key));

  const addField = (key: FieldKey) => setFields((prev) => [...prev, { key }]);
  const removeField = (key: FieldKey) => {
    delete fieldValuesRef.current[key];
    setFields((prev) => prev.filter((f) => f.key !== key));
  };
  const getFieldMeta = (key: FieldKey) => OPTIONAL_FIELDS.find((f) => f.key === key)!;

  // Initialize fieldValuesRef from existing vocab
  useMemo(() => {
    if (!existing) return;
    OPTIONAL_FIELDS.forEach((f) => {
      const val = (existing as any)[f.key];
      if (val) fieldValuesRef.current[f.key] = val;
    });
    vocabularyRef.current = existing.vocabulary;
  }, [existing]);

  const handleSave = async () => {
    const vocab = vocabularyRef.current.trim();
    if (!vocab) { Alert.alert("Word is required"); return; }
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(fieldValuesRef.current)) {
      if (value.trim()) payload[key] = value.trim();
    }
    try {
      await updateVocabAsync({
        id: vocabId!,
        packageId: packageId!,
        vocabulary: vocab,
        type: existing?.type ?? "",
        voice: existing?.voice ?? "",
        ...payload,
      });
      router.back();
    } catch {
      Alert.alert("Error", "Could not save changes.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingVertical: 14,
          backgroundColor: theme.colors.white,
          borderBottomWidth: 1, borderBottomColor: theme.colors.ink[100],
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.ink[900] }}>Edit Vocabulary</Text>
            <Text style={{ fontSize: 12, color: theme.colors.ink[400] }}>
              {decodeURIComponent(packageName ?? "")}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="always">
          {/* Word */}
          <View style={{
            backgroundColor: theme.colors.white, borderRadius: 14, padding: 14,
            borderWidth: 2, borderColor: vocabFilled ? theme.colors.primary[500] : theme.colors.ink[200], gap: 8,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 16 }}>📝</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.ink[500], letterSpacing: 0.5 }}>
                WORD *
              </Text>
            </View>
            <TextInput
              key={resetKey}
              defaultValue={existing?.vocabulary ?? ""}
              onChangeText={(v) => { vocabularyRef.current = v; setVocabFilled(v.length > 0); }}
              placeholder="e.g. hello"
              placeholderTextColor={theme.colors.ink[300]}
              autoCorrect={false}
              autoCapitalize="none"
              style={{ fontSize: 22, fontWeight: "700", color: theme.colors.ink[900] }}
            />
          </View>

          {/* Dynamic optional fields */}
          {fields.map(({ key }) => {
            const meta = getFieldMeta(key);
            return (
              <FieldInput
                key={key}
                resetKey={resetKey}
                icon={meta.icon}
                label={meta.label}
                placeholder={meta.placeholder}
                defaultValue={(existing as any)?.[key] ?? ""}
                onChangeText={(v) => { fieldValuesRef.current[key] = v; }}
                onRemove={() => removeField(key)}
                multiline={key.startsWith("example")}
                rtl={key === "meaning"}
              />
            );
          })}

          {/* Add field button */}
          {addedKeys.size < OPTIONAL_FIELDS.length && (
            <TouchableOpacity
              style={{
                borderWidth: 2, borderStyle: "dashed", borderColor: theme.colors.primary[300],
                borderRadius: 14, paddingVertical: 16,
                alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
              }}
              onPress={() => setPickerVisible(true)}
            >
              <Text style={{ fontSize: 22, color: theme.colors.primary[500], fontWeight: "300" }}>+</Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.primary[600] }}>Add a field</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save button */}
        <View style={{
          padding: 16, backgroundColor: theme.colors.white,
          borderTopWidth: 1, borderTopColor: theme.colors.ink[100],
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: vocabFilled ? theme.colors.primary[600] : theme.colors.ink[200],
              borderRadius: 14, paddingVertical: 15, alignItems: "center",
              opacity: isPending ? 0.7 : 1,
            }}
            onPress={handleSave}
            disabled={isPending || !vocabFilled}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
              {isPending ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <FieldPickerModal
        visible={pickerVisible}
        addedKeys={addedKeys}
        onAdd={addField}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
