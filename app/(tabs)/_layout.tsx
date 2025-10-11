import { useAuth } from "@/providers/auth-provider";
import { useSettings } from "@/providers/settings-provider";
import { useTheme } from "@/providers/theme-provider";
import { Tabs, router } from "expo-router";
import {
  Calendar,
  Crown,
  LayoutGrid,
  LogOut,
  Settings,
  Share2,
  Trash2,
  User,
  Zap
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function ProfileDropdown() {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const { devModeEnabled } = useSettings();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    router.replace("/login");
  };

  const handleUpgradePlan = () => {
    setShowDropdown(false);
    router.push("/subscription-plans");
  };

  const handleSharePreview = () => {
    const randomId = Math.random().toString(36).substring(7);
    const previewLink = `https://kroeva-dev.preview/${randomId}`;
    
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(previewLink);
      console.log("Dev link copied");
    } else {
      Clipboard.setString(previewLink);
      Alert.alert("Success", "Dev link copied", [{ text: "OK" }]);
    }
    setShowDropdown(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setShowDropdown(true)}
      >
        <User size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showDropdown}
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleUpgradePlan}
            >
              <Crown size={16} color="#1AC6C6" />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Upgrade Plan</Text>
            </TouchableOpacity>
            {devModeEnabled && (
              <>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleSharePreview}
                >
                  <Share2 size={16} color="#1AC6C6" />
                  <Text style={[styles.dropdownText, { color: colors.text }]}>Share Preview</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.dropdownDivider} />
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <LogOut size={16} color="#FF4444" />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const { aiFlowsEnabled } = useSettings();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('TabLayout: aiFlowsEnabled =', aiFlowsEnabled);
  }, [aiFlowsEnabled]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1AC6C6",
        tabBarInactiveTintColor: "#6B6B6B",
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: "#0B1F3B",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitle: () => (
          <View style={styles.headerTitle}>
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/spc642hgrf10edsvdhi8s" }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        ),
        headerRight: () => <ProfileDropdown />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Waste Score",
          tabBarIcon: ({ color }) => <Trash2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: "Apps",
          tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="renewals"
        options={{
          title: "Renewals",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-flows"
        options={{
          title: "AI Flows (Beta)",
          tabBarLabel: "AI Flows",
          tabBarIcon: ({ color }) => <Zap size={24} color={color} />,
          href: aiFlowsEnabled ? '/ai-flows' : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    height: 32,
    width: 120,
  },
  profileButton: {
    padding: 8,
    marginRight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdown: {
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF4444",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
});