import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const { logout, userToken } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>خوش آمدی 🌟</Text>
      <Text style={{ marginVertical: 10 }}>Token: {userToken}</Text>

      <TouchableOpacity onPress={logout} style={{ padding: 14, backgroundColor: "#f44", borderRadius: 8 }}>
        <Text style={{ color: "#fff" }}>خروج</Text>
      </TouchableOpacity>
    </View>
  );
}
