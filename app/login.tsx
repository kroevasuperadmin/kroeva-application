import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Chrome, Mail, Moon, Sun } from "lucide-react-native";
import React, { useEffect } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login, isAuthenticated, isOnboardingComplete } = useAuth();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isAuthenticated) {
      if (isOnboardingComplete) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, isOnboardingComplete]);

  const handleGoogleLogin = () => {
    login();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={isDarkMode ? ["#0A0F1B", "#1A2332"] : ["#0B1F3B", "#1A3A5C"]}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleDarkMode}
        >
          {isDarkMode ? (
            <Sun size={24} color="#FFFFFF" />
          ) : (
            <Moon size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/k77a9kilini42z99kdaqr" }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>
              Eliminate Software Waste, Maximize Value
            </Text>
          </View>

          <View style={styles.loginCard}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Sign in to manage your software subscriptions
            </Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <Chrome size={20} color="#4285F4" />
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.microsoftButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <Mail size={20} color="#00A4EF" />
              <Text style={styles.microsoftButtonText}>
                Continue with Microsoft
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>RM 2.3M</Text>
              <Text style={styles.statLabel}>Saved by users</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>1,247</Text>
              <Text style={styles.statLabel}>Companies</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Waste reduced</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    height: 80,
    width: 200,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#B4F14C",
    textAlign: "center",
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  microsoftButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  microsoftButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 400,
    marginTop: 40,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1AC6C6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
});