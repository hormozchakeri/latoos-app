import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLogin } from "@/hooks/auth/useLogin";
import { useRouter } from "expo-router";

export default function SignIn() {
  const { t } = useTranslation();
  const { mutate, isPending } = useLogin();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  const submit = () => {
    if (!username || !password)
      return alert(t("auth.fill_fields"));
    mutate({ username, password });
  };

  return (
    <View style={styles.container}>
      {/* Header Gradient */}
      <LinearGradient
        colors={["#065F46", "#10B981"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t("auth.welcome_back")}</Text>
      </LinearGradient>

      {/* Card */}
      <View style={styles.card}>
        {/* Skeleton حالت لود */}
        {isPending ? (
          <>
            <View style={styles.skeletonInput} />
            <View style={styles.skeletonInput} />
            <View style={styles.skeletonButton} />
          </>
        ) : (
          <>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={t("auth.username_placeholder")}
              placeholderTextColor="#555"
              style={styles.input}
            />

            {/* Password with toggle */}
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.password_placeholder")}
                placeholderTextColor="#555"
                secureTextEntry={secure}
                style={styles.passwordInput}
              />

              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Text style={styles.eye}>
                  {secure ? "👁" : "🙈"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={submit}>
              <Text style={styles.buttonText}>{t("auth.login")}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Navigation */}
        <Text style={styles.footerText}>
          {t("auth.no_account")}{" "}
          <Text
            style={styles.link}
            // onPress={() => router.push("/signup")}
          >
            {t("auth.sign_up")}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 180,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },

  input: {
    backgroundColor: "#EAD7B7",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAD7B7",
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 10,
  },

  passwordInput: {
    flex: 1,
    padding: 14,
  },

  eye: {
    fontSize: 18,
  },

  button: {
    backgroundColor: "#065F46",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  footerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#333",
  },

  link: {
    color: "#065F46",
    fontWeight: "600",
  },

  // 💀 Skeleton
  skeletonInput: {
    height: 50,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 14,
  },

  skeletonButton: {
    height: 55,
    backgroundColor: "#D1D5DB",
    borderRadius: 14,
    marginTop: 10,
  },
});
