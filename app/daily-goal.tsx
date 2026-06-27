import { theme } from "@/constants/theme";
import { DAILY_GOALS, type DailyGoalId } from "@/constants/dailyGoals";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { ArrowLeft, Check } from "@/components/Icon";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DailyGoalScreen() {
  const router = useRouter();
  const { goalId, updateGoal } = useDailyGoal();
  const [selected, setSelected] = useState<DailyGoalId>(goalId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateGoal(selected);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.white }}>
          Daily Goal
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero text */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 36 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.white, marginBottom: 8 }}>
            How much do you want to learn?
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 20 }}>
            We'll show you this many new words per package per day. You can change this anytime.
          </Text>
        </View>

        {/* Cards */}
        <View
          style={{
            backgroundColor: theme.colors.ink[50],
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 32,
            gap: 12,
          }}
        >
          {DAILY_GOALS.map((g) => {
            const isSelected = selected === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                activeOpacity={0.8}
                onPress={() => setSelected(g.id as DailyGoalId)}
                style={{
                  backgroundColor: isSelected ? g.color : theme.colors.white,
                  borderRadius: 18,
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  borderWidth: 2,
                  borderColor: isSelected ? g.color : theme.colors.ink[100],
                  shadowColor: g.color,
                  shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
                  shadowOpacity: isSelected ? 0.25 : 0.05,
                  shadowRadius: isSelected ? 12 : 4,
                  elevation: isSelected ? 6 : 2,
                }}
              >
                {/* Emoji badge */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.25)"
                      : `${g.color}18`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "800",
                      color: isSelected ? theme.colors.white : theme.colors.ink[900],
                    }}
                  >
                    {g.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isSelected ? "rgba(255,255,255,0.8)" : theme.colors.ink[400],
                      marginTop: 2,
                    }}
                  >
                    {g.description}
                  </Text>
                </View>

                {/* Cards badge */}
                <View
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.2)"
                      : theme.colors.ink[100],
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: isSelected ? theme.colors.white : g.color,
                    }}
                  >
                    {g.cardsPerPackage}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: isSelected ? "rgba(255,255,255,0.75)" : theme.colors.ink[400],
                      marginTop: 1,
                    }}
                  >
                    cards/day
                  </Text>
                </View>

                {/* Check */}
                {isSelected && (
                  <View
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "rgba(255,255,255,0.3)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={13} color={theme.colors.white} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Save button */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.hero,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
              opacity: saving ? 0.7 : 1,
            }}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>
                Save Goal
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
