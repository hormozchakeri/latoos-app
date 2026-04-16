import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getPackages, Package } from "@/api/packageApi";

const PackageListScreen = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);

      const res = await getPackages({
        pageNumber: 1,
        pageSize: 10,
        paging: true,
      });

      // 👇 بسته به ساختار API
      setPackages(res.items ?? res);
    } catch (err) {
      console.error(err);
      setError("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <FlatList
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {item.title}
          </Text>

          {item.description && (
            <Text style={{ color: "#666" }}>{item.description}</Text>
          )}

          {item.price && (
            <Text style={{ marginTop: 5 }}>💰 {item.price}</Text>
          )}
        </View>
      )}
    />
  );
};

export default PackageListScreen;