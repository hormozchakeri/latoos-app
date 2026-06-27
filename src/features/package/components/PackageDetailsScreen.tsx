import { theme } from "@/constants/theme";
import { useEnroll, useIsEnrolled } from "@/features/enrollment/hooks";
import { usePackageById } from "@/features/package/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeft, Share2 } from "@/components/Icon";
import { SafeAreaView } from "react-native-safe-area-context";

const THUMB_PALETTE = [
  { icon: "🌟", bg: theme.colors.primary[500] },
  { icon: "⛩",  bg: theme.colors.warning },
  { icon: "📚", bg: theme.colors.success },
  { icon: "🎯", bg: theme.colors.danger },
  { icon: "🚀", bg: theme.colors.info },
  { icon: "💡", bg: "#8B5CF6" },
];

function Tag({ label, amber = false }: { label: string; amber?: boolean }) {
  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{
        backgroundColor: amber ? theme.colors.warning : theme.colors.ink[100],
      }}
    >
      <Text
        className="text-xs font-semibold"
        style={{ color: amber ? theme.colors.white : theme.colors.ink[700] }}
      >
        {label}
      </Text>
    </View>
  );
}

const PackageDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: pkg, isLoading, error } = usePackageById(id!);
  const { data: enrollStatus, isLoading: enrollChecking } = useIsEnrolled(id!);
  const { mutate: enroll, isPending: enrolling } = useEnroll();

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.colors.ink[50] }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  if (error || !pkg) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.colors.ink[50] }}
      >
        <Text style={{ color: theme.colors.danger }}>
          {t("common.error_package_detail")}
        </Text>
      </View>
    );
  }

  const thumb = THUMB_PALETTE[1];
  const price = pkg.price != null ? `$${pkg.price.toFixed(2)}` : t("common.free");
  const enrolled = enrollStatus?.isEnrolled ?? false;

  const handleEnroll = () => {
    if (enrolled) return;
    enroll(id!, {
      onSuccess: () => Alert.alert(t("package_detail.enrolled_title"), t("package_detail.enrolled_message")),
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          t("package_detail.enroll_error");
        Alert.alert(t("common.error"), msg);
      },
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.colors.hero }}
      edges={["top"]}
    >
      {/* ── Hero ──────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: theme.colors.hero,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 52,
        }}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={theme.colors.white} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={theme.colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Centered avatar */}
        <View className="items-center">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center"
            style={{ backgroundColor: thumb.bg }}
          >
            <Text style={{ fontSize: 48 }}>{thumb.icon}</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable body ───────────────────────────── */}
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: theme.colors.white,
          marginTop: -28,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          className="text-xl font-extrabold"
          style={{ color: theme.colors.ink[900] }}
        >
          {pkg.packageName}
        </Text>

        {/* Tutor line */}
        <Text className="text-sm mt-1.5" style={{ color: theme.colors.ink[500] }}>
          {[
            pkg.producer ? t("common.by", { name: pkg.producer }) : null,
            pkg.rateCount != null
              ? t("package_detail.reviews", { count: pkg.rateCount })
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>

        {/* Tags */}
        <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
          {pkg.price != null && <Tag label={price} amber />}
          {pkg.rate  != null && <Tag label={`★ ${pkg.rate.toFixed(1)}`} />}
          {enrolled && <Tag label={t("package_detail.enrolled_badge")} />}
        </View>

        {/* About this course */}
        {pkg.description ? (
          <>
            <Text
              className="text-sm font-bold mt-6 mb-2"
              style={{ color: theme.colors.ink[900] }}
            >
              {t("package_detail.about")}
            </Text>
            <Text
              className="text-sm leading-6"
              style={{ color: theme.colors.ink[500] }}
            >
              {pkg.description}
            </Text>
          </>
        ) : null}
      </ScrollView>

      {/* ── Action button ─────────────────────────────── */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3"
        style={{ backgroundColor: theme.colors.white }}
      >
        <TouchableOpacity
          className="items-center justify-center py-4 rounded-2xl"
          style={{
            backgroundColor: enrolled
              ? theme.colors.primary[600]
              : theme.colors.danger,
            opacity: enrolling || enrollChecking ? 0.7 : 1,
          }}
          activeOpacity={0.85}
          onPress={handleEnroll}
          disabled={enrolling || enrollChecking || enrolled}
        >
          {enrolling || enrollChecking ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text
              className="text-base font-bold"
              style={{ color: theme.colors.white }}
            >
              {enrolled
                ? t("package_detail.continue_learning")
                : t("package_detail.enroll", { price })}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PackageDetailsScreen;
