import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type Props = {
  color?: string;
  size?: "small" | "large";
};

export function LoadingSpinner({ color = "#4F46E5", size = "large" }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
