import { theme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  BookOpen,
  Target,
  LogOut,
  type LucideIcon,
} from "@/components/Icon";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function MenuItem({
  Icon,
  iconColor,
  iconBg,
  label,
  sublabel,
  onPress,
  danger,
}: {
  Icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const resolvedIconColor = danger
    ? theme.colors.danger
    : iconColor ?? theme.colors.primary[600];
  const resolvedIconBg = danger ? "#FEE2E2" : iconBg ?? theme.colors.primary[50];

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.white,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          backgroundColor: resolvedIconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color={resolvedIconColor} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: danger ? theme.colors.danger : theme.colors.ink[900],
          }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={{ fontSize: 12, color: theme.colors.ink[400], marginTop: 2 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {!danger && <ChevronRight size={18} color={theme.colors.ink[300]} strokeWidth={2} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const { goal } = useDailyGoal();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.ink[50] }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.ink[900] }}>Profile</Text>
      </View>

      {/* Menu */}
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.ink[400], letterSpacing: 1, paddingLeft: 4, marginBottom: 4 }}>
          MY CONTENT
        </Text>

        <MenuItem
          Icon={BookOpen}
          label="My Packages"
          sublabel="Create and manage your word sets"
          onPress={() => router.push("/my-packages")}
        />

        <MenuItem
          Icon={Target}
          label="Daily Goal"
          sublabel={`${goal.label} — ${goal.cardsPerPackage} cards / day`}
          onPress={() => router.push("/daily-goal")}
        />

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.ink[400], letterSpacing: 1, paddingLeft: 4, marginBottom: 4 }}>
            ACCOUNT
          </Text>
        </View>

        <MenuItem
          Icon={LogOut}
          label="Sign Out"
          onPress={logout}
          danger
        />
      </View>
    </SafeAreaView>
  );
}
