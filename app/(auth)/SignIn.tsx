import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLogin } from "@/hooks/auth/useLogin";

export default function SignIn() {
  const { mutate, isPending } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    if (!username || !password) return alert("لطفاً همه فیلدها را پر کنید.");
    mutate({ username, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ورود</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="نام کاربری"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="رمز عبور"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={submit} disabled={isPending}>
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>ورود</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
