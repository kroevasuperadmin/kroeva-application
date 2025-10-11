import { useSettings } from "@/providers/settings-provider";
import { useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import { router } from "expo-router";
import { AlertCircle, ArrowRight, Plus, Zap } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AIFlowsScreen() {
  const { colors } = useTheme();
  const { aiFlowsEnabled, devModeEnabled } = useSettings();
  const { currentPlan } = useSubscription();
  const insets = useSafeAreaInsets();

  const handleCreateFlow = () => {
    router.push("/flow-builder" as any);
  };

  const isPaidPlan = currentPlan !== "free";
  const canCreateFlows = devModeEnabled || isPaidPlan;

  if (!aiFlowsEnabled) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!isPaidPlan && (
          <View style={styles.betaBanner}>
            <AlertCircle size={20} color="#0B1F3B" />
            <Text style={styles.betaBannerText}>
              Beta access – subscribe to enable creation
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Zap size={28} color="#1AC6C6" />
            <View>
              <View style={styles.titleRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  AI Flows
                </Text>
                <View style={styles.betaBadge}>
                  <Text style={styles.betaBadgeText}>BETA</Text>
                </View>
              </View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Automate your workflows
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={[styles.emptyStateCard, { backgroundColor: colors.card }]}>
            <View style={styles.emptyStateIcon}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop&crop=center"
                }}
                style={styles.emptyStateImage}
              />
            </View>
            
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No flows yet
            </Text>
            
            <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
              Create your first AI-powered workflow to automate repetitive tasks across your SaaS applications.
            </Text>
            
            <View style={styles.createButtonContainer}>
              <TouchableOpacity
                style={[styles.createButton, !canCreateFlows && styles.createButtonDisabled]}
                onPress={handleCreateFlow}
                disabled={!canCreateFlows}
              >
                <Plus size={20} color={canCreateFlows ? "#FFFFFF" : "#999999"} />
                <Text style={canCreateFlows ? styles.createButtonText : styles.createButtonTextDisabled}>Create Flow</Text>
              </TouchableOpacity>
              {!canCreateFlows && (
                <View style={styles.unlockBadge}>
                  <Text style={styles.unlockBadgeText}>Subscribe to unlock</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What you can automate
          </Text>
          
          <View style={styles.featuresList}>
            <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📧</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Email Workflows
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Auto-respond to emails, create tasks from messages
                </Text>
              </View>
              <ArrowRight size={16} color={colors.textSecondary} />
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📊</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Data Sync
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Sync data between CRM, spreadsheets, and databases
                </Text>
              </View>
              <ArrowRight size={16} color={colors.textSecondary} />
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🔔</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Smart Notifications
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Get alerts when important events happen
                </Text>
              </View>
              <ArrowRight size={16} color={colors.textSecondary} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  betaBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C6F04C",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  betaBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1F3B",
  },
  header: {
    marginBottom: 32,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  betaBadge: {
    backgroundColor: "#FF9800",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  betaBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyState: {
    marginBottom: 32,
  },
  emptyStateCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createButtonContainer: {
    position: "relative",
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#1AC6C6",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonTextDisabled: {
    color: "#999999",
    fontSize: 16,
    fontWeight: "600",
  },
  unlockBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#C6F04C",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 120,
  },
  unlockBadgeText: {
    color: "#0B1F3B",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
