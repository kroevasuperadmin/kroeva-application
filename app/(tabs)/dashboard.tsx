import { useAuth } from "@/providers/auth-provider";
import { useSettings } from "@/providers/settings-provider";
import { useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, Calculator, Database, TrendingDown, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const { currency, devModeEnabled } = useSettings();
  const { currentPlan, monthlySavings } = useSubscription();
  const { isOnboardingComplete } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showROIModal, setShowROIModal] = useState(false);
  const [roiSeats, setROISeats] = useState(100);
  const [liveCounter, setLiveCounter] = useState(18450);
  const insets = useSafeAreaInsets();

  const wastePercentage = 32;
  const savedAmount = currency === "RM" ? 18450 : Math.round(18450 * 0.22);
  const potentialSavings = currency === "RM" ? 8750 : Math.round(8750 * 0.22);
  const topWasteApp = "Slack";
  const topWasteAmount = currency === "RM" ? 2800 : Math.round(2800 * 0.22);

  useEffect(() => {
    if (!isOnboardingComplete) return;
    
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + 312);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOnboardingComplete]);

  const formatCurrency = (amount: number, showTilde = false) => {
    const roundedAmount = Math.round(amount / 10) * 10;
    const formattedAmount = roundedAmount.toLocaleString('en-MY');
    return `${showTilde ? '~' : ''}${currency} ${formattedAmount}`;
  };

  const unusedSeats = [
    { id: "1", app: "Slack", seats: 12, cost: currency === "RM" ? 420 : Math.round(420 * 0.22) },
    { id: "2", app: "Figma", seats: 8, cost: currency === "RM" ? 560 : Math.round(560 * 0.22) },
    { id: "3", app: "Notion", seats: 15, cost: currency === "RM" ? 375 : Math.round(375 * 0.22) },
    { id: "4", app: "GitHub", seats: 5, cost: currency === "RM" ? 280 : Math.round(280 * 0.22) },
  ];

  const totalSavings = unusedSeats.reduce((sum, item) => sum + item.cost, 0);

  const calculateROI = () => {
    const costPerSeat = 12;
    const wasteRate = 0.32;
    const monthlySavings = roiSeats * costPerSeat * wasteRate;
    const yearOneSavings = monthlySavings * 12;
    const paybackMonths = (roiSeats * costPerSeat * 0.1) / monthlySavings;
    
    return {
      monthlySavings: Math.round(monthlySavings),
      yearOneSavings: Math.round(yearOneSavings),
      paybackMonths: Math.round(paybackMonths * 10) / 10
    };
  };

  const roi = calculateROI();

  const handleCancelWaste = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!devModeEnabled) {
      return;
    }
    
    setIsCancelling(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setTimeout(() => {
      setIsCancelling(false);
      setShowCancelModal(false);
      if (Platform.OS === "web") {
        console.log(`${formatCurrency(totalSavings)} saved – cancellation emails sent`);
      } else {
        Alert.alert(
          "Success!",
          `${formatCurrency(totalSavings)} saved – cancellation emails sent`,
          [{ text: "OK" }]
        );
      }
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {!isOnboardingComplete && (
            <View style={[styles.noDataBanner, { backgroundColor: colors.card }]}>
              <Database size={20} color="#FFA500" />
              <Text style={[styles.noDataText, { color: colors.text }]}>
                Connect to see savings
              </Text>
            </View>
          )}

          {currentPlan !== "free" && isOnboardingComplete && (
            <View style={styles.savingsChip}>
              <Text style={styles.savingsChipText}>
                Savings-share saved you {formatCurrency(monthlySavings)} this month
              </Text>
            </View>
          )}

          {isOnboardingComplete && (
            <View style={[styles.liveCounterCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.liveCounterLabel, { color: colors.textSecondary }]}>
                RM saved today
              </Text>
              <Text style={[
                styles.liveCounterValue, 
                { 
                  color: isDarkMode ? "#C6F04C" : "#B4F14C",
                  textShadowColor: isDarkMode ? "rgba(198, 240, 76, 0.5)" : "transparent",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: isDarkMode ? 10 : 0,
                }
              ]}>
                {formatCurrency(liveCounter)}
              </Text>
            </View>
          )}

          <LinearGradient
            colors={isDarkMode ? ["#1A2332", "#0A0F1B"] : ["#FFFFFF", "#F8F9FA"]}
            style={[styles.mainCard, !isOnboardingComplete && styles.dimmedCard]}
          >
            <View style={styles.cardHeader}>
              <TrendingDown size={24} color="#FF4444" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Software Waste Score
              </Text>
            </View>

            <View style={styles.wasteMainContainer}>
              <View style={styles.wastePercentageContainer}>
                <Text style={[styles.wastePercentage, { color: isDarkMode ? "#FFFFFF" : "#0B1F3B" }]}>
                  {isOnboardingComplete ? `${wastePercentage}%` : '0%'}
                </Text>
                <Text style={[styles.savingsAmount, { color: isDarkMode ? "#C6F04C" : "#B4F14C" }]}>
                  {isOnboardingComplete ? formatCurrency(savedAmount) : formatCurrency(0)} saved
                </Text>
              </View>
            </View>

            <View style={styles.miniCardsRow}>
              <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
                <Text style={styles.miniCardValue}>{isOnboardingComplete ? '47' : '0'}</Text>
                <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Apps</Text>
              </View>
              <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
                <Text style={styles.miniCardValue}>{isOnboardingComplete ? '234' : '0'}</Text>
                <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Seats</Text>
              </View>
              <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
                <Text style={styles.miniCardValue}>{isOnboardingComplete ? '12' : '0'}</Text>
                <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Unused</Text>
              </View>
              <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
                <Text style={styles.miniCardValue}>{isOnboardingComplete ? '89' : '0'}</Text>
                <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Inactive</Text>
              </View>
            </View>

            {isOnboardingComplete && (
              <View style={styles.topWastePill}>
                <Text style={styles.topWasteText}>
                  Top Waste: {topWasteApp} {formatCurrency(topWasteAmount, true)}
                </Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, !isOnboardingComplete && styles.disabledButton]}
                onPress={isOnboardingComplete ? handleCancelWaste : undefined}
                activeOpacity={isOnboardingComplete ? 0.8 : 1}
                disabled={!isOnboardingComplete}
              >
                <Text style={styles.cancelButtonText}>
                  {isOnboardingComplete ? 'Cancel Waste' : 'Connect Data to Start'}
                </Text>
              </TouchableOpacity>

              {isOnboardingComplete && (
                <TouchableOpacity
                  style={styles.roiButton}
                  onPress={() => setShowROIModal(true)}
                >
                  <Calculator size={16} color="#FFFFFF" />
                  <Text style={styles.roiButtonText}>Calculate ROI</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.potentialContainer}>
              <AlertCircle size={16} color="#FFA500" />
              <Text style={[styles.potentialText, { color: colors.textSecondary }]}>
                {isOnboardingComplete 
                  ? `Potential monthly savings: ${formatCurrency(potentialSavings, true)}`
                  : 'Connect your data sources to see potential savings'
                }
              </Text>
            </View>
          </LinearGradient>

          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
            {isOnboardingComplete ? (
              <>
                <View style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                    Adobe Creative Cloud renewal in 60 days
                  </Text>
                </View>
                <View style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: "#B4F14C" }]} />
                  <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                    Saved {formatCurrency(currency === "RM" ? 2340 : Math.round(2340 * 0.22))} by removing 15 Slack seats
                  </Text>
                </View>
                <View style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: "#FFA500" }]} />
                  <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                    Microsoft 365 has 23 inactive users
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No activity yet. Connect your data sources to start tracking.
                </Text>
              </View>
            )}
          </View>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showCancelModal}
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCancelModal(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Confirm Cancellation
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                The following unused seats will be cancelled:
              </Text>

              <View style={styles.seatsList}>
                {unusedSeats.map((item) => (
                  <View key={item.id} style={styles.seatItem}>
                    <Text style={[styles.seatApp, { color: colors.text }]}>
                      {item.app}
                    </Text>
                    <Text style={[styles.seatDetails, { color: colors.textSecondary }]}>
                      {item.seats} seats • {formatCurrency(item.cost)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>
                  Total Savings
                </Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(totalSavings)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton, 
                  (isCancelling || !devModeEnabled) && styles.confirmButtonDisabled
                ]}
                onPress={confirmCancellation}
                disabled={isCancelling || !devModeEnabled}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>
                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                </Text>
                {!devModeEnabled && (
                  <View style={styles.upgradeBadge}>
                    <Text style={styles.upgradeBadgeText}>Upgrade to use</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showROIModal}
          onRequestClose={() => setShowROIModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.roiModalContent, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowROIModal(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.modalTitle, { color: colors.text }]}>
                ROI Calculator
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Estimate your savings based on number of seats
              </Text>

              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: colors.text }]}>
                  Number of seats: {roiSeats}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={50}
                  maximumValue={1000}
                  step={10}
                  value={roiSeats}
                  onValueChange={setROISeats}
                  minimumTrackTintColor="#1AC6C6"
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor="#1AC6C6"
                />
              </View>

              <View style={styles.roiResults}>
                <View style={styles.roiResultItem}>
                  <Text style={[styles.roiResultLabel, { color: colors.textSecondary }]}>
                    Monthly Savings
                  </Text>
                  <Text style={[styles.roiResultValue, { color: "#1AC6C6" }]}>
                    {formatCurrency(roi.monthlySavings)}
                  </Text>
                </View>
                <View style={styles.roiResultItem}>
                  <Text style={[styles.roiResultLabel, { color: colors.textSecondary }]}>
                    Year-1 Savings
                  </Text>
                  <Text style={[styles.roiResultValue, { color: "#4CAF50" }]}>
                    {formatCurrency(roi.yearOneSavings)}
                  </Text>
                </View>
                <View style={styles.roiResultItem}>
                  <Text style={[styles.roiResultLabel, { color: colors.textSecondary }]}>
                    Payback Period
                  </Text>
                  <Text style={[styles.roiResultValue, { color: "#FF9800" }]}>
                    {roi.paybackMonths} months
                  </Text>
                </View>
              </View>

              <View style={styles.roiChart}>
                <View style={styles.roiBar}>
                  <View style={[styles.roiBarFill, { width: `${Math.min((roi.paybackMonths / 24) * 100, 100)}%` }]} />
                </View>
                <Text style={[styles.roiChartLabel, { color: colors.textSecondary }]}>
                  Payback in &lt;{Math.ceil(roi.paybackMonths)} months
                </Text>
              </View>
            </View>
          </View>
        </Modal>
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
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  liveCounterCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  liveCounterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  liveCounterValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  mainCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  wasteMainContainer: {
    marginBottom: 24,
  },
  wastePercentageContainer: {
    alignItems: "flex-start",
  },
  wastePercentage: {
    fontSize: 64,
    fontWeight: "bold",
    lineHeight: 64,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  miniCardsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  miniCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  miniCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1AC6C6",
    marginBottom: 2,
  },
  miniCardLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  topWastePill: {
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
    marginBottom: 16,
  },
  topWasteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1F3B",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  roiButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roiButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  potentialContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  potentialText: {
    fontSize: 14,
  },
  activityCard: {
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1AC6C6",
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  roiModalContent: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  seatsList: {
    marginBottom: 20,
  },
  seatItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  seatApp: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  seatDetails: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B4F14C",
  },
  confirmButton: {
    backgroundColor: "#FF4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
  savingsChip: {
    backgroundColor: "#C6F04C",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
    marginBottom: 16,
  },
  savingsChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0B1F3B",
    textAlign: "center",
  },
  noDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dimmedCard: {
    opacity: 0.7,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  roiResults: {
    gap: 16,
    marginBottom: 24,
  },
  roiResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roiResultLabel: {
    fontSize: 14,
  },
  roiResultValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  roiChart: {
    marginTop: 16,
  },
  roiBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  roiBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  roiChartLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});
