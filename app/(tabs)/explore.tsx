import { theme } from "@/constants/theme";
import { usePackages } from "@/features/package/hooks";
import type { Package } from "@/features/package/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES = [
  { id: "en", flag: "🇬🇧", name: "English" },
  { id: "es", flag: "🇪🇸", name: "Spanish" },
  { id: "ja", flag: "🇯🇵", name: "Japanese" },
  { id: "biz", flag: "💼", name: "Business" },
];

const THUMB_PALETTE = [
  { icon: "🌟", bg: theme.colors.primary[500] },
  { icon: "⛩", bg: theme.colors.warning },
  { icon: "📚", bg: theme.colors.success },
  { icon: "🎯", bg: theme.colors.danger },
  { icon: "🚀", bg: theme.colors.info },
  { icon: "💡", bg: "#8B5CF6" },
];

function thumb(index: number) {
  return THUMB_PALETTE[index % THUMB_PALETTE.length];
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState("en");
  const { data, isLoading, error } = usePackages();
  const router = useRouter();

  const packages: Package[] = data?.items ?? [];

  function renderPackages() {
    if (isLoading) {
      return (
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center justify-center py-10">
          <Text style={{ color: theme.colors.danger }}>
            {t("common.error_packages")}
          </Text>
        </View>
      );
    }

    if (packages.length === 0) {
      return (
        <View className="items-center justify-center py-10">
          <Text style={{ color: theme.colors.ink[500] }}>
            {t("common.no_packages")}
          </Text>
        </View>
      );
    }

    return packages.map((pkg, index) => {
      const { icon, bg } = thumb(index);
      const price = pkg.price != null ? `$${pkg.price.toFixed(2)}` : t("common.free");

      return (
        <TouchableOpacity
          key={pkg.id}
          className="flex-row items-start rounded-2xl p-3.5 mb-3"
          style={{
            backgroundColor: theme.colors.white,
            gap: 12,
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
          activeOpacity={0.85}
          onPress={() => router.push(`/package-details?id=${pkg.id}`)}
        >
          {/* Thumbnail */}
          <View
            className="w-14 h-14 rounded-xl items-center justify-center"
            style={{ backgroundColor: bg }}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>

          {/* Info */}
          <View className="flex-1" style={{ gap: 6 }}>
            {/* Row 1 — name + price */}
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-bold flex-1 mr-2"
                style={{ color: theme.colors.ink[900] }}
                numberOfLines={2}
              >
                {pkg.packageName}
              </Text>
              <Text
                className="text-sm font-bold"
                style={{ color: theme.colors.ink[900] }}
              >
                {price}
              </Text>
            </View>

            {/* Row 2 — description */}
            {pkg.description ? (
              <Text
                className="text-xs"
                style={{ color: theme.colors.ink[500] }}
                numberOfLines={2}
              >
                {pkg.description}
              </Text>
            ) : null}

            {/* Row 3 — producer + rating */}
            <View className="flex-row items-center justify-between">
              {pkg.producer ? (
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.colors.warning }}
                >
                  ⭐ {t("common.by", { name: pkg.producer })}
                </Text>
              ) : (
                <View />
              )}

              {pkg.rate != null ? (
                <View
                  className="flex-row items-center px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: theme.colors.ink[100] }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: theme.colors.warning }}
                  >
                    ⭐ {pkg.rate.toFixed(1)}
                  </Text>
                  {pkg.rateCount != null && (
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.ink[500] }}
                    >
                      {" "}
                      ({pkg.rateCount})
                    </Text>
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.colors.hero }}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ─────────────────────────────────────── */}
        <View
          className="px-6 pt-6 pb-9"
          style={{ backgroundColor: theme.colors.hero }}
        >
          <Text
            className="text-2xl font-extrabold leading-9"
            style={{ color: theme.colors.white }}
          >
            {t("explore.hero_title")}
          </Text>
          <View className="flex-row mt-5" style={{ gap: 6 }}>
            <View
              className="h-2 w-5 rounded-full"
              style={{ backgroundColor: theme.colors.white }}
            />
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
            />
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
            />
          </View>
        </View>

        {/* ── Body ─────────────────────────────────────── */}
        <View
          className="rounded-t-3xl px-5 pt-6 pb-8"
          style={{
            backgroundColor: theme.colors.ink[50],
            marginTop: -20,
            minHeight: 600,
          }}
        >
          {/* Browse by Language */}
          <Text
            className="text-base font-bold mb-3.5"
            style={{ color: theme.colors.ink[900] }}
          >
            {t("explore.browse_by_language")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -20, marginBottom: 24 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {LANGUAGES.map((lang) => {
              const active = activeLanguage === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  className="flex-row items-center rounded-full px-3.5 py-2 h-14"
                  style={{
                    gap: 6,
                    backgroundColor: active
                      ? theme.colors.primary[50]
                      : theme.colors.white,
                    borderWidth: 1.5,
                    borderColor: active
                      ? theme.colors.primary[500]
                      : theme.colors.ink[200],
                  }}
                  onPress={() => setActiveLanguage(lang.id)}
                  activeOpacity={0.75}
                >
                  <Text className="text-lg">{lang.flag}</Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: active ? theme.colors.primary[600] : "#475569",
                    }}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Featured Packages */}
          <Text
            className="text-base font-bold mb-3.5"
            style={{ color: theme.colors.ink[900] }}
          >
            {t("explore.featured_packages")}
          </Text>
          {renderPackages()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
