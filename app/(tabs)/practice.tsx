import { theme } from "@/constants/theme";
import { useDailySession, useRateCard } from "@/features/practice/hooks";
import type { PracticeCard, Rating } from "@/features/practice/types";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { useRouter } from "expo-router";
import { ChevronRight } from "@/components/Icon";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function FlashCard({
  card,
  revealed,
  onReveal,
}: {
  card: PracticeCard;
  revealed: boolean;
  onReveal: () => void;
}) {
  const { t } = useTranslation();
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (revealed) {
      Animated.spring(flipAnim, {
        toValue: 1,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [revealed]);

  const flip = () => {
    if (revealed) return;
    onReveal();
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <TouchableOpacity
      style={{ width: "100%", height: 280 }}
      onPress={flip}
      activeOpacity={0.95}
    >
      {/* Front — question */}
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.white,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
          backfaceVisibility: "hidden",
          transform: [{ rotateY: frontRotate }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 12, color: theme.colors.ink[400], marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
          {t("session.question")}
        </Text>
        <Text style={{ fontSize: 32, fontWeight: "800", color: theme.colors.ink[900], textAlign: "center" }}>
          {card.question}
        </Text>
        {card.usage ? (
          <Text style={{ fontSize: 13, color: theme.colors.ink[500], marginTop: 16, textAlign: "center", fontStyle: "italic", lineHeight: 20 }}>
            {card.usage}
          </Text>
        ) : null}
        {card.packageName ? (
          <View
            style={{
              marginTop: 16,
              backgroundColor: theme.colors.ink[100],
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 11, color: theme.colors.ink[500] }}>
              {card.packageName}
            </Text>
          </View>
        ) : null}
        <Text style={{ fontSize: 12, color: theme.colors.ink[300], marginTop: 16 }}>
          {t("session.tap_to_reveal")}
        </Text>
      </Animated.View>

      {/* Back — answer */}
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.primary[600],
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
          backfaceVisibility: "hidden",
          transform: [{ rotateY: backRotate }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
          {t("session.answer")}
        </Text>
        <Text style={{ fontSize: 34, fontWeight: "800", color: theme.colors.white, textAlign: "center" }}>
          {card.answer}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PracticeTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const { goal, isGoalSet } = useDailyGoal();

  const { data: cards, isLoading, error, refetch } = useDailySession();
  const { mutate: rateCard } = useRateCard();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const card = cards?.[index];
  const total = cards?.length ?? 0;

  // Safety net: if index drifts past total (e.g. cards refetched mid-session),
  // always land on the finished screen instead of a blank card.
  useEffect(() => {
    if (total > 0 && index >= total && !finished) {
      setFinished(true);
    }
  }, [index, total, finished]);

  const handleRate = (r: Rating) => {
    if (!card || advancing) return;
    // Fire rating in background — don't block the UI on it
    rateCard({ vocabId: card.vocabId, packageId: card.packageId, rating: r });
    // Advance immediately (optimistic)
    setAdvancing(true);
    const next = index + 1;
    if (next >= total) {
      setFinished(true);
      setRevealed(false);
    } else {
      setIndex(next);
      setRevealed(false);
    }
    setAdvancing(false);
  };

  const restart = () => {
    refetch();
    setIndex(0);
    setRevealed(false);
    setFinished(false);
  };

  // Loading
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.white} />
        </View>
      </SafeAreaView>
    );
  }

  // Error or no enrolled packages
  if (error || (!isLoading && total === 0)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
          <Text style={{ fontSize: 48 }}>🎯</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: theme.colors.white, textAlign: "center" }}>
            {t("practice.no_cards_title")}
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
            {t("practice.no_cards_subtitle")}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: 14,
              paddingHorizontal: 28,
              paddingVertical: 14,
              marginTop: 8,
            }}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
              {t("library.browse_packages")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Finished
  if (finished) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
          <Text style={{ fontSize: 64 }}>🎉</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: theme.colors.white, textAlign: "center" }}>
            {t("session.session_done")}
          </Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
            {t("session.reviewed_count", { count: total })}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 16,
              marginTop: 16,
            }}
            onPress={restart}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>
              {t("practice.review_again")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.white }}>
          {t("practice.hero_title")}
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
          {t("practice.card_count", { current: index + 1, total })}
        </Text>

        {/* Progress bar */}
        <View
          style={{
            height: 6,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 3,
            marginTop: 14,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${((index + 1) / total) * 100}%`,
              height: "100%",
              backgroundColor: theme.colors.white,
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      {/* Card + buttons */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.ink[50],
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 28,
        }}
      >
        {/* Goal setup prompt — shown until the user explicitly picks a goal */}
        {isGoalSet === false && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: theme.colors.primary[200],
            }}
            onPress={() => router.push("/daily-goal")}
          >
            <Text style={{ fontSize: 22 }}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: theme.colors.ink[900] }}>
                Set your daily goal
              </Text>
              <Text style={{ fontSize: 11, color: theme.colors.ink[400], marginTop: 1 }}>
                Currently: {goal.cardsPerPackage} cards/day — tap to customise
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.ink[300]} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {card && (
          <FlashCard
            key={card.vocabId}
            card={card}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        )}

        {/* Dot indicators */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 24 }}>
          {Array.from({ length: Math.min(total, 7) }).map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index % 7 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i < index % 7
                    ? theme.colors.primary[400]
                    : i === index % 7
                    ? theme.colors.primary[600]
                    : theme.colors.ink[200],
              }}
            />
          ))}
        </View>

        {/* Show Answer button */}
        {!revealed && (
          <TouchableOpacity
            style={{
              marginTop: "auto",
              backgroundColor: theme.colors.accent,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
            onPress={() => setRevealed(true)}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>
              {t("session.show_answer")}
            </Text>
          </TouchableOpacity>
        )}

        {/* Hard / Good / Easy */}
        {revealed && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: "auto" }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.danger,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                opacity: advancing ? 0.6 : 1,
              }}
              onPress={() => handleRate("Hard")}
              disabled={advancing}
            >
              <Text style={{ fontSize: 22 }}>😓</Text>
              <Text style={{ color: theme.colors.white, fontWeight: "700", marginTop: 4 }}>
                {t("session.hard")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#0D9488",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                opacity: advancing ? 0.6 : 1,
              }}
              onPress={() => handleRate("Good")}
              disabled={advancing}
            >
              <Text style={{ fontSize: 22 }}>🙂</Text>
              <Text style={{ color: theme.colors.white, fontWeight: "700", marginTop: 4 }}>
                {t("session.good")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#F59E0B",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                opacity: advancing ? 0.6 : 1,
              }}
              onPress={() => handleRate("Easy")}
              disabled={advancing}
            >
              <Text style={{ fontSize: 22 }}>😄</Text>
              <Text style={{ color: theme.colors.white, fontWeight: "700", marginTop: 4 }}>
                {t("session.easy")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
