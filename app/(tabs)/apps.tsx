import { useSettings } from "@/providers/settings-provider";
import { useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import { router } from "expo-router";
import { Minus, Search, TrendingDown, TrendingUp } from "lucide-react-native";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface App {
  id: string;
  name: string;
  logo: string;
  monthlyCost: number;
  lastUsed: string;
  users: number;
  trend: "up" | "down" | "stable";
  category: string;
}

const mockApps: App[] = [
  {
    id: "1",
    name: "Slack",
    logo: "https://logo.clearbit.com/slack.com",
    monthlyCost: 2800,
    lastUsed: "Today",
    users: 45,
    trend: "up",
    category: "Communication",
  },
  {
    id: "2",
    name: "Figma",
    logo: "https://logo.clearbit.com/figma.com",
    monthlyCost: 3500,
    lastUsed: "2 days ago",
    users: 12,
    trend: "stable",
    category: "Design",
  },
  {
    id: "3",
    name: "Notion",
    logo: "https://logo.clearbit.com/notion.so",
    monthlyCost: 1200,
    lastUsed: "1 week ago",
    users: 67,
    trend: "up",
    category: "Productivity",
  },
  {
    id: "4",
    name: "GitHub",
    logo: "https://logo.clearbit.com/github.com",
    monthlyCost: 1800,
    lastUsed: "Today",
    users: 23,
    trend: "up",
    category: "Development",
  },
  {
    id: "5",
    name: "Adobe Creative Cloud",
    logo: "https://logo.clearbit.com/adobe.com",
    monthlyCost: 8900,
    lastUsed: "3 days ago",
    users: 8,
    trend: "down",
    category: "Design",
  },
  {
    id: "6",
    name: "Microsoft 365",
    logo: "https://logo.clearbit.com/microsoft.com",
    monthlyCost: 5600,
    lastUsed: "Today",
    users: 89,
    trend: "stable",
    category: "Productivity",
  },
  {
    id: "7",
    name: "Zoom",
    logo: "https://logo.clearbit.com/zoom.us",
    monthlyCost: 980,
    lastUsed: "5 days ago",
    users: 34,
    trend: "down",
    category: "Communication",
  },
  {
    id: "8",
    name: "Jira",
    logo: "https://logo.clearbit.com/atlassian.com",
    monthlyCost: 2100,
    lastUsed: "Today",
    users: 28,
    trend: "up",
    category: "Project Management",
  },
];

export default function AppsScreen() {
  const { colors } = useTheme();
  const { currency } = useSettings();
  const { currentPlan, isFeatureEnabled } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const insets = useSafeAreaInsets();

  const categories = ["All", "Communication", "Design", "Productivity", "Development", "Project Management"];

  const filteredApps = mockApps.filter(app => {
    const searchTerm = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchTerm || app.name.toLowerCase().includes(searchTerm);
    const validCategory = selectedCategory && selectedCategory.trim();
    const matchesCategory = !validCategory || validCategory === "All" || app.category === validCategory;
    return matchesSearch && matchesCategory;
  });

  const convertCurrency = (amount: number) => {
    return currency === "USD" ? Math.round(amount * 0.22) : amount;
  };

  // Helper function to format currency with Malaysian/UK comma separator and rounding
  const formatCurrency = (amount: number, showTilde = false) => {
    const convertedAmount = convertCurrency(amount);
    const roundedAmount = Math.round(convertedAmount / 10) * 10; // Round to nearest 10
    const formattedAmount = roundedAmount.toLocaleString('en-MY'); // Malaysian format with commas
    return `${showTilde ? '~' : ''}${currency} ${formattedAmount}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={16} color="#4CAF50" />;
      case "down":
        return <TrendingDown size={16} color="#FF4444" />;
      default:
        return <Minus size={16} color="#999999" />;
    }
  };

  const handleAppPress = (app: App) => {
    if (currentPlan === "free") {
      router.push("/subscription-plans");
      return;
    }
    router.push({
      pathname: "/app-detail" as any,
      params: {
        appId: app.id,
        appName: app.name,
        appLogo: app.logo,
        monthlyCost: app.monthlyCost.toString(),
        users: app.users.toString(),
        category: app.category,
        trend: app.trend,
        lastUsed: app.lastUsed
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header with Title and Search */}
      <View style={styles.headerContainer}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Apps</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search apps..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => {
                if (category && category.trim() && category.length <= 50) {
                  setSelectedCategory(category.trim());
                }
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Apps List */}
      <ScrollView 
        style={styles.appsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredApps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={[styles.appCard, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => handleAppPress(app)}
          >
            <Image source={{ uri: app.logo }} style={styles.appLogo} />
            
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: colors.text }]}>
                {app.name}
              </Text>
              <Text style={[styles.appCategory, { color: colors.textSecondary }]}>
                {app.category} • {app.users} users
              </Text>
              <Text style={[styles.lastUsed, { color: colors.textSecondary }]}>
                Last used: {app.lastUsed}
              </Text>
            </View>

            <View style={styles.appCost}>
              <Text style={[styles.costAmount, { color: colors.text }]}>
                {formatCurrency(app.monthlyCost, true)}
              </Text>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                /month
              </Text>
              <View style={styles.trendContainer}>
                {getTrendIcon(app.trend)}
              </View>
              {currentPlan === "free" && (
                <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeBadgeText}>Upgrade to use</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 20,
    backgroundColor: "#1AC6C6",
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: "#0B1F3B",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  appsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  appLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  appCategory: {
    fontSize: 12,
    marginBottom: 2,
  },
  lastUsed: {
    fontSize: 12,
  },
  appCost: {
    alignItems: "flex-end",
  },
  costAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  costLabel: {
    fontSize: 12,
  },
  trendContainer: {
    marginTop: 4,
  },
  upgradeBadge: {
    backgroundColor: "#C6F04C",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  upgradeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0B1F3B",
  },
});