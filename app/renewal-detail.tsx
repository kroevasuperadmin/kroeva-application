import { useSettings } from "@/providers/settings-provider";
import { useTheme } from "@/providers/theme-provider";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Users
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RenewalDetailScreen() {
  const { colors } = useTheme();
  const { currency } = useSettings();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isPostponing, setIsPostponing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const renewalData = {
    id: params.renewalId as string,
    app: params.app as string,
    daysLeft: parseInt(params.daysLeft as string),
    cost: parseInt(params.cost as string),
    status: params.status as string,
    renewalDate: params.renewalDate as string,
    seats: parseInt(params.seats as string)
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
        return <AlertTriangle size={20} color="#FF4444" />;
      case "upcoming":
        return <Clock size={20} color="#FFA500" />;
      case "safe":
        return <CheckCircle size={20} color="#4CAF50" />;
      default:
        return null;
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePostpone = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsPostponing(true);
    
    setTimeout(() => {
      setIsPostponing(false);
      
      if (Platform.OS === "web") {
        console.log(`${renewalData.app} renewal postponed by 30 days`);
      } else {
        Alert.alert(
          "Success!",
          `${renewalData.app} renewal postponed by 30 days`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
      
      if (Platform.OS === "web") {
        setTimeout(() => router.back(), 1000);
      }
    }, 1500);
  };

  const handleCancel = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsCancelling(true);
    
    setTimeout(() => {
      setIsCancelling(false);
      
      if (Platform.OS === "web") {
        console.log(`${renewalData.app} renewal cancelled - ${formatCurrency(renewalData.cost)} saved`);
      } else {
        Alert.alert(
          "Success!",
          `${renewalData.app} renewal cancelled - ${formatCurrency(renewalData.cost)} saved`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
      
      if (Platform.OS === "web") {
        setTimeout(() => router.back(), 1000);
      }
    }, 1500);
  };

  // Mock seat list
  const seatList = [
    { id: "1", name: "John Smith", email: "john@company.com", lastActive: "2 days ago" },
    { id: "2", name: "Sarah Johnson", email: "sarah@company.com", lastActive: "1 week ago" },
    { id: "3", name: "Mike Chen", email: "mike@company.com", lastActive: "Today" },
    { id: "4", name: "Lisa Brown", email: "lisa@company.com", lastActive: "3 days ago" },
    { id: "5", name: "David Wilson", email: "david@company.com", lastActive: "5 days ago" },
  ].slice(0, Math.min(5, renewalData.seats));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Renewal Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Renewal Info Card */}
        <LinearGradient
          colors={renewalData.status === "urgent" ? ["#FF4444", "#FF6666"] : 
                 colors.background === "#FFFFFF" ? ["#FFFFFF", "#F8F9FA"] : ["#1A2332", "#0A0F1B"]}
          style={styles.renewalCard}
        >
          <View style={styles.renewalHeader}>
            <View style={styles.renewalInfo}>
              <Text style={[styles.renewalApp, { 
                color: renewalData.status === "urgent" ? "#FFFFFF" : colors.text 
              }]}>
                {renewalData.app}
              </Text>
              <View style={styles.statusContainer}>
                {getStatusIcon(renewalData.status)}
                <Text style={[styles.statusText, { 
                  color: renewalData.status === "urgent" ? "#FFFFFF" : getStatusColor(renewalData.status) 
                }]}>
                  {renewalData.daysLeft} days left
                </Text>
              </View>
              <Text style={[styles.renewalDate, { 
                color: renewalData.status === "urgent" ? "rgba(255, 255, 255, 0.8)" : colors.textSecondary 
              }]}>
                Renews on {renewalData.renewalDate}
              </Text>
            </View>
            <View style={styles.costContainer}>
              <Text style={[styles.costAmount, { 
                color: renewalData.status === "urgent" ? "#FFFFFF" : colors.text 
              }]}>
                {formatCurrency(renewalData.cost)}
              </Text>
              <Text style={[styles.costLabel, { 
                color: renewalData.status === "urgent" ? "rgba(255, 255, 255, 0.8)" : colors.textSecondary 
              }]}>
                renewal cost
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Users size={24} color="#1AC6C6" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {renewalData.seats}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Seats
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Calendar size={24} color="#1AC6C6" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {renewalData.daysLeft}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Days Left
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <DollarSign size={24} color="#1AC6C6" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(Math.round(renewalData.cost / renewalData.seats))}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Cost per Seat
            </Text>
          </View>
        </View>

        {/* Seat List */}
        <View style={[styles.seatListCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Seat Usage ({seatList.length} of {renewalData.seats})
          </Text>
          {seatList.map((seat) => (
            <View key={seat.id} style={styles.seatItem}>
              <View style={styles.seatInfo}>
                <Text style={[styles.seatName, { color: colors.text }]}>
                  {seat.name}
                </Text>
                <Text style={[styles.seatEmail, { color: colors.textSecondary }]}>
                  {seat.email}
                </Text>
              </View>
              <Text style={[styles.lastActive, { color: colors.textSecondary }]}>
                {seat.lastActive}
              </Text>
            </View>
          ))}
          {renewalData.seats > seatList.length && (
            <Text style={[styles.moreSeats, { color: colors.textSecondary }]}>
              +{renewalData.seats - seatList.length} more seats
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.postponeButton, isPostponing && styles.buttonDisabled]}
            onPress={handlePostpone}
            disabled={isPostponing || isCancelling}
          >
            <Text style={styles.postponeButtonText}>
              {isPostponing ? "Postponing..." : "Postpone 30 days"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={isPostponing || isCancelling}
          >
            <Text style={styles.cancelButtonText}>
              {isCancelling ? "Cancelling..." : "Cancel Now"}
            </Text>
          </TouchableOpacity>
        </View>
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
  renewalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  renewalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  renewalInfo: {
    flex: 1,
  },
  renewalApp: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  renewalDate: {
    fontSize: 14,
  },
  costContainer: {
    alignItems: "flex-end",
  },
  costAmount: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  costLabel: {
    fontSize: 12,
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
  seatListCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  seatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  seatInfo: {
    flex: 1,
  },
  seatName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  seatEmail: {
    fontSize: 12,
  },
  lastActive: {
    fontSize: 12,
  },
  moreSeats: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  postponeButton: {
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  postponeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});