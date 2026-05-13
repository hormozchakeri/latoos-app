import { usePackages } from "@/features/package/hooks";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Package } from "@/features/package/types";

const PackageListScreen = () => {
  const { data, isLoading, error } = usePackages();
  const router = useRouter();

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#EF4444" }}>خطا در دریافت پکیج‌ها</Text>
      </View>
    );
  }

  const packages = data?.items ?? [];

  const renderItem: ListRenderItem<Package> = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/package-details?id=${item.id}`)}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{item.packageName}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      <View style={styles.rowBetween}>
        <Text style={styles.author}>⭐ By {item.producer}</Text>

        <View style={styles.ratingBox}>
          <Text style={styles.ratingText}>
            ⭐ {item.rate} ({item.rateCount})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Big packages</Text>
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#64748B" }}>
              در حال حاضر پکیجی موجود نیست
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#4F46E5",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
    marginRight: 10,
  },

  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },

  description: {
    marginTop: 6,
    marginBottom: 10,
    color: "#64748B",
    fontSize: 14,
  },

  author: {
    color: "#F59E0B",
    fontSize: 13,
  },

  ratingBox: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  ratingText: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "bold",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});

export default PackageListScreen;
