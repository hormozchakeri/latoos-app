import { theme } from "@/constants/theme";
import { usePracticeSession } from "@/features/practice/hooks";
import { useRateCard } from "@/features/practice/hooks";
import type { PracticeCard, Rating } from "@/features/practice/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeft, RefreshCcw, ThumbsUp, Zap } from "@/components/Icon";
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

  const handleFlip = () => {
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
      style={{ width: "100%", height: 260 }}
      onPress={handleFlip}
      activeOpacity={0.9}
    >
      {/* Front */}
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.white,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backfaceVisibility: "hidden",
          transform: [{ rotateY: frontRotate }],
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Text style={{ fontSize: 13, color: theme.colors.ink[400], marginBottom: 12 }}>
          {t("session.question")}
        </Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: theme.colors.ink[900], textAlign: "center" }}>
          {card.question}
        </Text>
        {card.usage ? (
          <Text style={{ fontSize: 13, color: theme.colors.ink[500], marginTop: 14, textAlign: "center", fontStyle: "italic", lineHeight: 20 }}>
            {card.usage}
          </Text>
        ) : null}
        <Text style={{ fontSize: 12, color: theme.colors.ink[400], marginTop: 14 }}>
          {t("session.tap_to_reveal")}
        </Text>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.primary[50],
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backfaceVisibility: "hidden",
          transform: [{ rotateY: backRotate }],
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Text style={{ fontSize: 13, color: theme.colors.primary[600], marginBottom: 12 }}>
          {t("session.answer")}
        </Text>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            color: theme.colors.primary[700],
            textAlign: "center",
          }}
        >
          {card.answer}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PracticeSessionScreen() {
  const { packageId, packageName } = useLocalSearchParams<{
    packageId: string;
    packageName: string;
  }>();
  const router    = useRouter();
  const { t }     = useTranslation();

  const { data: cards, isLoading, error } = usePracticeSession(packageId!);
  const { mutate: rateCard, isPending: rating } = useRateCard();

  const [index,    setIndex]    = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const card = cards?.[index];

  const handleRate = (r: Rating) => {
    if (!card) return;
    rateCard(
      { vocabId: card.vocabId, packageId: packageId!, rating: r },
      {
        onSuccess: () => {
          const next = index + 1;
          if (next >= (cards?.length ?? 0)) {
            setFinished(true);
          } else {
            setIndex(next);
            setRevealed(false);
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.white} />
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 16, fontSize: 14 }}>
            Loading cards…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !cards) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} color={theme.colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.ink[50],
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 56 }}>⚠️</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: theme.colors.ink[900], textAlign: "center" }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.ink[400], textAlign: "center", lineHeight: 22 }}>
            We couldn't load the practice session. Make sure you have vocabulary cards in this package.
          </Text>

          <View style={{ width: "100%", gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.accent,
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
              }}
              onPress={() => router.back()}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <ArrowLeft size={16} color={theme.colors.white} strokeWidth={2.5} />
                <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>Go Back</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: 1.5, borderColor: theme.colors.ink[200],
              }}
              onPress={() => router.navigate("/(tabs)/explore")}
            >
              <Text style={{ color: theme.colors.ink[700], fontWeight: "600", fontSize: 15 }}>
                🔍  Browse Packages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: 1.5, borderColor: theme.colors.ink[200],
              }}
              onPress={() => router.navigate("/(tabs)/index")}
            >
              <Text style={{ color: theme.colors.ink[700], fontWeight: "600", fontSize: 15 }}>
                👤  Go to Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Finished / empty screen
  if (finished || cards.length === 0) {
    const isEmpty = cards.length === 0 && !finished;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} color={theme.colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.ink[50],
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 64 }}>{isEmpty ? "📭" : "🎉"}</Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.ink[900], textAlign: "center" }}>
            {isEmpty ? "No cards due" : t("session.session_done")}
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.ink[400], textAlign: "center", lineHeight: 22 }}>
            {isEmpty
              ? "This package has no vocabulary cards yet, or none are due for review right now."
              : t("session.reviewed_count", { count: cards.length })}
          </Text>

          <View style={{ width: "100%", gap: 12, marginTop: 16 }}>
            {!isEmpty && (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary[600],
                  borderRadius: 14, paddingVertical: 15, alignItems: "center",
                }}
                onPress={() =>
                  router.replace(
                    `/arena?packageId=${packageId}&packageName=${encodeURIComponent(packageName ?? "")}`
                  )
                }
              >
                <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
                  {t("session.take_exam")}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: isEmpty ? theme.colors.accent : theme.colors.white,
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: isEmpty ? 0 : 1.5,
                borderColor: theme.colors.ink[200],
              }}
              onPress={() => router.back()}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <ArrowLeft size={16} color={isEmpty ? theme.colors.white : theme.colors.accent} strokeWidth={2.5} />
                <Text style={{ color: isEmpty ? theme.colors.white : theme.colors.accent, fontWeight: "600", fontSize: 15 }}>Back to Library</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: 1.5, borderColor: theme.colors.ink[200],
              }}
              onPress={() => router.navigate("/(tabs)/explore")}
            >
              <Text style={{ color: theme.colors.ink[700], fontWeight: "600", fontSize: 15 }}>
                🔍  Browse Packages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: 1.5, borderColor: theme.colors.ink[200],
              }}
              onPress={() => router.navigate("/(tabs)/index")}
            >
              <Text style={{ color: theme.colors.ink[700], fontWeight: "600", fontSize: 15 }}>
                👤  Go to Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.hero }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={20} color={theme.colors.white} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
          {decodeURIComponent(packageName ?? "")}
        </Text>

        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
          {index + 1}/{cards.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          marginHorizontal: 20,
          height: 6,
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 3,
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${((index + 1) / cards.length) * 100}%`,
            height: "100%",
            backgroundColor: theme.colors.white,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Card area */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.ink[50],
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 24,
        }}
      >
        {card && (
          <FlashCard
            key={card.vocabId}
            card={card}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        )}

        {/* Card count dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {cards.slice(0, Math.min(cards.length, 7)).map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i < index
                    ? theme.colors.primary[400]
                    : i === index
                    ? theme.colors.primary[600]
                    : theme.colors.ink[200],
              }}
            />
          ))}
        </View>

        {/* Rating buttons */}
        {revealed && (
          <View style={{ flexDirection: "row", gap: 12, marginTop: "auto", paddingTop: 24 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#EF4444",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                opacity: rating ? 0.6 : 1,
              }}
              onPress={() => handleRate("Hard")}
              disabled={rating}
            >
              <RefreshCcw size={22} color={theme.colors.white} strokeWidth={2.5} style={{ marginBottom: 4 }} />
              <Text style={{ color: theme.colors.white, fontWeight: "700" }}>
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
                opacity: rating ? 0.6 : 1,
              }}
              onPress={() => handleRate("Good")}
              disabled={rating}
            >
              <ThumbsUp size={22} color={theme.colors.white} strokeWidth={2.5} style={{ marginBottom: 4 }} />
              <Text style={{ color: theme.colors.white, fontWeight: "700" }}>
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
                opacity: rating ? 0.6 : 1,
              }}
              onPress={() => handleRate("Easy")}
              disabled={rating}
            >
              <Zap size={22} color={theme.colors.white} strokeWidth={2.5} style={{ marginBottom: 4 }} />
              <Text style={{ color: theme.colors.white, fontWeight: "700" }}>
                {t("session.easy")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
              {t("session.show_answer")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
