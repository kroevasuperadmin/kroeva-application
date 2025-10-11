import { useSettings } from "@/providers/settings-provider";
import { useTheme } from "@/providers/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AlertTriangle, Calendar, CheckCircle, Clock } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Renewal {
  id: string;
  app: string;
  daysLeft: number;
  cost: number;
  status: "urgent" | "upcoming" | "safe";
  renewalDate: string;
  seats: number;
}

const mockRenewals: Renewal[] = [
  {
    id: "1",
    app: "Adobe Creative Cloud",
    daysLeft: 60,
    cost: 8900,
    status: "upcoming",
    renewalDate: "2025-03-26",
    seats: 8,
  },
  {
    id: "2",
    app: "Slack",
    daysLeft: 15,
    cost: 2800,
    status: "urgent",
    renewalDate: "2025-02-09",
    seats: 45,
  },
  {
    id: "3",
    app: "Microsoft 365",
    daysLeft: 120,
    cost: 5600,
    status: "safe",
    renewalDate: "2025-05-25",
    seats: 89,
  },
  {
    id: "4",
    app: "Figma",
    daysLeft: 30,
    cost: 3500,
    status: "upcoming",
    renewalDate: "2025-02-24",
    seats: 12,
  },
  {
    id: "5",
    app: "GitHub",
    daysLeft: 7,
    cost: 1800,
    status: "urgent",
    renewalDate: "2025-02-01",
    seats: 23,
  },
  {
    id: "6",
    app: "Notion",
    daysLeft: 90,
    cost: 1200,
    status: "safe",
    renewalDate: "2025-04-25",
    seats: 67,
  },
];

export default function RenewalsScreen() {
  const { colors } = useTheme();
  const { currency } = useSettings();
  const insets = useSafeAreaInsets();

  // Sort renewals by days left (ascending) and prioritize urgent ones (≤14 days)
  const sortedRenewals = [...mockRenewals]
    .map(renewal => ({
      ...renewal,
      status: (renewal.daysLeft <= 14 ? "urgent" : renewal.daysLeft <= 30 ? "upcoming" : "safe") as "urgent" | "upcoming" | "safe"
    }))
    .sort((a, b) => {
      // First sort by urgency (urgent first), then by days left
      if (a.status === "urgent" && b.status !== "urgent") return -1;
      if (b.status === "urgent" && a.status !== "urgent") return 1;
      return a.daysLeft - b.daysLeft;
    });
  
  const urgentRenewal = sortedRenewals.find(r => r.status === "urgent");

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "#FF4444";
      case "upcoming":
        return "#FFA500";
      case "safe":
        return "#4CAF50";
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "urgent":
        return <AlertTriangle size={16} color="#FF4444" />;
      case "upcoming":
        return <Clock size={16} color="#FFA500" />;
      case "safe":
        return <CheckCircle size={16} color="#4CAF50" />;
      default:
        return null;
    }
  };

  const handleRenewalPress = (renewal: Renewal) => {
    router.push({
      pathname: "/renewal-detail" as any,
      params: {
        renewalId: renewal.id,
        app: renewal.app,
        daysLeft: renewal.daysLeft.toString(),
        cost: renewal.cost.toString(),
        status: renewal.status,
        renewalDate: renewal.renewalDate,
        seats: renewal.seats.toString()
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
      {/* Urgent Banner */}
      {urgentRenewal && (
        <LinearGradient
          colors={["#FF4444", "#FF6666"]}
          style={styles.urgentBanner}
        >
          <View style={styles.bannerContent}>
            <AlertTriangle size={24} color="#FFFFFF" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                {urgentRenewal.daysLeft} days left on {urgentRenewal.app}
              </Text>
              <Text style={styles.bannerSubtitle}>
                Renewal amount: {formatCurrency(urgentRenewal.cost)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Review Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Calendar size={20} color="#1AC6C6" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {mockRenewals.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Renewals
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <AlertTriangle size={20} color="#FF4444" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {mockRenewals.filter(r => r.status === "urgent").length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Urgent
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={styles.summaryValueSmall}>
            {formatCurrency(mockRenewals.reduce((sum, r) => sum + r.cost, 0))}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Cost
          </Text>
        </View>
      </View>

      {/* Renewals List */}
      <View style={styles.listContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Upcoming Renewals
        </Text>
        
        {sortedRenewals.map((renewal) => (
          <TouchableOpacity
            key={renewal.id}
            style={[
              styles.renewalCard, 
              { backgroundColor: renewal.status === "urgent" ? "#FF4444" : colors.card }
            ]}
            activeOpacity={0.7}
            onPress={() => handleRenewalPress(renewal)}
          >
            <View style={styles.renewalHeader}>
              <View style={styles.renewalInfo}>
                <Text style={[styles.renewalApp, { color: renewal.status === "urgent" ? "#FFFFFF" : colors.text }]}>
                  {renewal.app}
                </Text>
                <View style={styles.renewalMeta}>
                  <Text style={[styles.renewalSeats, { color: renewal.status === "urgent" ? "rgba(255, 255, 255, 0.8)" : colors.textSecondary }]}>
                    {renewal.seats} seats
                  </Text>
                  <Text style={[styles.renewalDate, { color: renewal.status === "urgent" ? "rgba(255, 255, 255, 0.8)" : colors.textSecondary }]}>
                    • {renewal.renewalDate}
                  </Text>
                </View>
              </View>
              <View style={styles.renewalStatus}>
                {renewal.status === "urgent" ? <AlertTriangle size={16} color="#FFFFFF" /> : getStatusIcon(renewal.status)}
                <Text style={[styles.daysLeft, { color: renewal.status === "urgent" ? "#FFFFFF" : getStatusColor(renewal.status) }]}>
                  {renewal.daysLeft} days
                </Text>
              </View>
            </View>
            
            <View style={styles.renewalFooter}>
              <Text style={[styles.renewalCost, { color: renewal.status === "urgent" ? "#FFFFFF" : colors.text }]}>
                {formatCurrency(renewal.cost)}
              </Text>
              <TouchableOpacity style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>Review</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
  urgentBanner: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  bannerButtonText: {
    color: "#FF4444",
    fontWeight: "600",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValueSmall: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1AC6C6",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  renewalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  renewalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  renewalInfo: {
    flex: 1,
  },
  renewalApp: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  renewalMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  renewalSeats: {
    fontSize: 12,
  },
  renewalDate: {
    fontSize: 12,
  },
  renewalStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  daysLeft: {
    fontSize: 14,
    fontWeight: "600",
  },
  renewalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  renewalCost: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewButton: {
    backgroundColor: "#1AC6C6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});