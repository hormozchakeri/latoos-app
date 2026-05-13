import { usePackageById } from "@/features/package/hooks";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PackageDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = usePackageById(id!);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#EF4444" }}>خطا در دریافت اطلاعات پکیج</Text>
      </View>
    );
  }

  const pkg = data;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{pkg.packageName}</Text>
          <Text style={styles.producer}>By {pkg.producer}</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {pkg.rate}</Text>
            <Text style={styles.rateCount}>({pkg.rateCount})</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{pkg.description}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>${pkg.price}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Buy Package</Text>
      </TouchableOpacity>
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
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  producer: {
    color: "#E0E7FF",
    marginTop: 6,
  },

  ratingContainer: {
    flexDirection: "row",
    marginTop: 10,
  },

  rating: {
    color: "#FBBF24",
    fontWeight: "bold",
  },

  rateCount: {
    color: "#E0E7FF",
    marginLeft: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },

  description: {
    color: "#475569",
    lineHeight: 22,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  priceLabel: {
    color: "#64748B",
  },

  price: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "bold",
  },

  button: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PackageDetailsScreen;
