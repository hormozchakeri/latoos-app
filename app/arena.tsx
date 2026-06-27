import { theme } from "@/constants/theme";
import { useExamQuestions, useSubmitExam } from "@/features/arena/hooks";
import type { ExamAnswer } from "@/features/arena/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "@/components/Icon";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function ArenaScreen() {
  const { packageId, packageName } = useLocalSearchParams<{
    packageId: string;
    packageName: string;
  }>();
  const router  = useRouter();
  const { t }   = useTranslation();

  const { data: questions, isLoading, error } = useExamQuestions(packageId!);
  const { mutate: submit, isPending: submitting, data: result } = useSubmitExam();

  const [index,     setIndex]     = useState(0);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [answers,   setAnswers]   = useState<ExamAnswer[]>([]);
  const [seconds,   setSeconds]   = useState(28 * 60 + 45);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!questions || result) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          handleFinish([...answers]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [questions, result]);

  const handleFinish = (finalAnswers: ExamAnswer[]) => {
    clearInterval(timerRef.current!);
    submit({ packageId: packageId!, answers: finalAnswers });
  };

  const handleSubmit = () => {
    if (!selected || !questions) return;
    const newAnswer: ExamAnswer = {
      vocabId: questions[index].vocabId,
      selectedAnswer: selected,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (index + 1 >= questions.length) {
      handleFinish(newAnswers);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.hero }}>
        <ActivityIndicator size="large" color={theme.colors.white} />
      </View>
    );
  }

  if (error || !questions) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.hero }}>
        <Text style={{ color: theme.colors.white }}>{t("common.error")}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)" }}>{t("session.back_to_library")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Result screen
  if (result) {
    const passed = result.score >= 60;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
          <Text style={{ fontSize: 72 }}>{passed ? "🏆" : "📖"}</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: theme.colors.white, textAlign: "center" }}>
            {passed ? t("arena.result_passed") : t("arena.result_try_again")}
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 56, fontWeight: "800", color: theme.colors.white }}>
              {result.score}%
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
              {t("arena.correct_of", {
                correct: result.correctAnswers,
                total: result.totalQuestions,
              })}
            </Text>
          </View>

          <View style={{ width: "100%", gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.accent,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
              onPress={() => router.back()}
            >
              <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>
                {t("arena.back_to_practice")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const question = questions[index];
  const mins     = Math.floor(seconds / 60);
  const secs     = seconds % 60;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.hero }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#F59E0B",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>⏱</Text>
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 15 }}>
              {pad(mins)}:{pad(secs)}
            </Text>
          </View>
        </View>

        <Text style={{ color: theme.colors.white, fontWeight: "800", fontSize: 20, marginTop: 16 }}>
          {decodeURIComponent(packageName ?? "")}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
          {t("arena.question_of", { current: index + 1, total: questions.length })}
        </Text>
      </View>

      {/* Body */}
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: theme.colors.white,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 120,
        }}
      >
        <Text style={{ fontSize: 14, color: theme.colors.ink[500], marginBottom: 6 }}>
          {t("arena.translate_prompt")}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.ink[900], marginBottom: 28 }}>
          "{question.question}"
        </Text>

        {question.options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 2,
              borderColor:
                selected === opt ? theme.colors.primary[500] : theme.colors.ink[200],
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              backgroundColor:
                selected === opt ? theme.colors.primary[50] : theme.colors.white,
            }}
            onPress={() => setSelected(opt)}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor:
                  selected === opt ? theme.colors.primary[500] : theme.colors.ink[300],
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected === opt && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: theme.colors.primary[500],
                  }}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: 15,
                color:
                  selected === opt ? theme.colors.primary[700] : theme.colors.ink[700],
                fontWeight: selected === opt ? "600" : "400",
              }}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Submit button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 32,
          paddingTop: 12,
          backgroundColor: theme.colors.white,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#F59E0B",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            opacity: selected && !submitting ? 1 : 0.4,
          }}
          onPress={handleSubmit}
          disabled={!selected || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={{ color: theme.colors.white, fontWeight: "700", fontSize: 16 }}>
              {index + 1 >= questions.length ? t("arena.finish") : t("arena.next")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
