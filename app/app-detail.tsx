import { useSettings } from "@/providers/settings-provider";
import { useTheme } from "@/providers/theme-provider";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Minus,
    TrendingDown,
    TrendingUp,
    Users
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppDetailScreen() {
  const { colors } = useTheme();
  const { currency, devModeEnabled } = useSettings();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isRemoving, setIsRemoving] = useState(false);

  const appData = {
    id: params.appId as string,
    name: params.appName as string,
    logo: params.appLogo as string,
    monthlyCost: parseInt(params.monthlyCost as string),
    users: parseInt(params.users as string),
    category: params.category as string,
    trend: params.trend as string,
    lastUsed: params.lastUsed as string
  };

  const convertCurrency = (amount: number) => {
    return currency === "USD" ? Math.round(amount * 0.22) : amount;
  };

  const formatCurrency = (amount: number, showTilde = false) => {
    const convertedAmount = convertCurrency(amount);
    const roundedAmount = Math.round(convertedAmount / 10) * 10;
    const formattedAmount = roundedAmount.toLocaleString('en-MY');
    return `${showTilde ? '~' : ''}${currency} ${formattedAmount}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={20} color="#4CAF50" />;
      case "down":
        return <TrendingDown size={20} color="#FF4444" />;
      default:
        return <Minus size={20} color="#999999" />;
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRemoveSeats = async () => {
    if (!devModeEnabled) {
      return;
    }
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsRemoving(true);
    
    setTimeout(() => {
      setIsRemoving(false);
      const seatsToRemove = appData.name === "Slack" ? 15 : Math.floor(appData.users * 0.3);
      const savings = Math.round((appData.monthlyCost / appData.users) * seatsToRemove);
      
      if (Platform.OS === "web") {
        console.log(`Removed ${seatsToRemove} seats from ${appData.name} - ${formatCurrency(savings)} saved`);
      } else {
        Alert.alert(
          "Success!",
          `Removed ${seatsToRemove} seats from ${appData.name} - ${formatCurrency(savings)} saved`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
      
      if (Platform.OS === "web") {
        setTimeout(() => router.back(), 1000);
      }
    }, 2000);
  };

  // Mock usage data for chart
  const usageData = [
    { month: "Jan", usage: 85 },
    { month: "Feb", usage: 92 },
    { month: "Mar", usage: 78 },
    { month: "Apr", usage: 88 },
    { month: "May", usage: 95 },
    { month: "Jun", usage: 82 }
  ];

  const costTrend = [
    { month: "Jan", cost: appData.monthlyCost * 0.9 },
    { month: "Feb", cost: appData.monthlyCost * 0.95 },
    { month: "Mar", cost: appData.monthlyCost * 0.85 },
    { month: "Apr", cost: appData.monthlyCost * 0.92 },
    { month: "May", cost: appData.monthlyCost * 1.0 },
    { month: "Jun", cost: appData.monthlyCost * 0.98 }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          App Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info Card */}
        <LinearGradient
          colors={colors.background === "#FFFFFF" ? ["#FFFFFF", "#F8F9FA"] : ["#1A2332", "#0A0F1B"]}
          style={styles.appCard}
        >
          <View style={styles.appHeader}>
            <Image source={{ uri: appData.logo }} style={styles.appLogo} />
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: colors.text }]}>
                {appData.name}
              </Text>
              <Text style={[styles.appCategory, { color: colors.textSecondary }]}>
                {appData.category}
              </Text>
              <View style={styles.trendContainer}>
                {getTrendIcon(appData.trend)}
                <Text style={[styles.trendText, { color: colors.textSecondary }]}>
                  Usage trend
                </Text>
              </View>
            </View>
            <View style={styles.costContainer}>
              <Text style={[styles.costAmount, { color: colors.text }]}>
                {formatCurrency(appData.monthlyCost)}
              </Text>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                /month
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Users size={24} color="#1AC6C6" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {appData.users}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active Users
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Calendar size={24} color="#1AC6C6" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {appData.lastUsed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Last Used
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <DollarSign size={24} color="#1AC6C6" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(Math.round(appData.monthlyCost / appData.users))}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Cost per User
            </Text>
          </View>
        </View>

        {/* Usage Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Usage Trend (6 months)
          </Text>
          <View style={styles.chartContainer}>
            {usageData.map((data, index) => (
              <View key={data.month} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${data.usage}%`,
                      backgroundColor: data.usage > 90 ? "#4CAF50" : data.usage > 70 ? "#1AC6C6" : "#FFA500"
                    }
                  ]} 
                />
                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                  {data.month}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cost Trend */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Cost Trend (6 months)
          </Text>
          <View style={styles.chartContainer}>
            {costTrend.map((data, index) => (
              <View key={data.month} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${(data.cost / appData.monthlyCost) * 100}%`,
                      backgroundColor: data.cost > appData.monthlyCost * 0.95 ? "#FF4444" : "#1AC6C6"
                    }
                  ]} 
                />
                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                  {data.month}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.removeButton, (isRemoving || !devModeEnabled) && styles.removeButtonDisabled]}
          onPress={handleRemoveSeats}
          disabled={isRemoving || !devModeEnabled}
        >
          <Text style={styles.removeButtonText}>
            {isRemoving ? "Removing..." : `Remove ${appData.name === "Slack" ? "15" : Math.floor(appData.users * 0.3)} seats`}
          </Text>
          {!devModeEnabled && (
            <View style={styles.upgradeBadge}>
              <Text style={styles.upgradeBadgeText}>Upgrade to use</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  appCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendText: {
    fontSize: 12,
  },
  costContainer: {
    alignItems: "flex-end",
  },
  costAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  costLabel: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  chartCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 10,
  },
  removeButton: {
    backgroundColor: "#FF4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  upgradeBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#C6F04C",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upgradeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0B1F3B",
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});