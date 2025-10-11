import { useSettings } from "@/providers/settings-provider";
import { PlanType, useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check, Phone, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SubscriptionPlansScreen() {
  const { colors, isDarkMode } = useTheme();
  const { currentPlan, planDetails, setCurrentPlan } = useSubscription();
  const { currency } = useSettings();
  const insets = useSafeAreaInsets();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSelectPlan = (plan: PlanType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (plan === "enterprise") {
      // Contact sales for enterprise
      console.log("Contact sales for enterprise plan");
      return;
    }

    if (plan === "free") {
      setCurrentPlan(plan);
      router.back();
      return;
    }

    // Navigate to checkout for paid plans
    router.push({
      pathname: "/stripe-checkout",
      params: { plan }
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "RM 0";
    let finalPrice = price;
    if (isAnnual && price > 0) {
      finalPrice = price * 10; // 10 months instead of 12 (2 months free)
    }
    const convertedPrice = currency === "USD" ? Math.round(finalPrice * 0.22) : finalPrice;
    return `${currency} ${convertedPrice}`;
  };

  const formatPriceUnit = (price: number) => {
    if (price === 0) return "";
    if (isAnnual) {
      return "/seat annually";
    }
    return "/seat monthly";
  };

  const getBillingNote = (price: number) => {
    if (price === 0 || !isAnnual) return null;
    return "Billed annually";
  };

  const renderPlanCard = (planKey: PlanType) => {
    const plan = planDetails[planKey];
    const isCurrentPlan = currentPlan === planKey;
    const isFree = planKey === "free";
    const isEnterprise = planKey === "enterprise";

    return (
      <View
        key={planKey}
        style={[
          styles.planCard,
          { backgroundColor: colors.card },
          isCurrentPlan && styles.currentPlanCard
        ]}
      >
        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: colors.text }]}>
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.planPrice, { color: colors.text }]}>
              {formatPrice(plan.price)}
            </Text>
            {!isFree && (
              <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>
                {formatPriceUnit(plan.price)}
              </Text>
            )}
          </View>
          {getBillingNote(plan.price) && (
            <Text style={[styles.billingNote, { color: colors.textSecondary }]}>
              {getBillingNote(plan.price)}
            </Text>
          )}
        </View>

        <View style={styles.planDetails}>
          <Text style={[styles.seatLimit, { color: colors.textSecondary }]}>
            {plan.maxSeats === -1 ? "Unlimited seats" : `${plan.maxSeats} seats max`}
          </Text>
          
          <View style={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={16} color="#1AC6C6" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.selectButton,
            isCurrentPlan && styles.currentButton,
            isFree && styles.freeButton,
            isEnterprise && styles.enterpriseButton
          ]}
          onPress={() => handleSelectPlan(planKey)}
          activeOpacity={0.8}
        >
          {isEnterprise ? (
            <View style={styles.contactSalesContent}>
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactSalesText}>Contact Sales</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.selectButtonText,
                isCurrentPlan && styles.currentButtonText,
                isFree && styles.freeButtonText
              ]}
            >
              {isCurrentPlan ? "Current" : "Select"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose Your Plan
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.billingToggle, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            !isAnnual && styles.activeToggle
          ]}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setIsAnnual(false);
          }}
        >
          <Text style={[
            styles.toggleText,
            { color: !isAnnual ? "#FFFFFF" : colors.textSecondary }
          ]}>
            Pay monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            isAnnual && styles.activeToggle
          ]}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setIsAnnual(true);
          }}
        >
          <Text style={[
            styles.toggleText,
            { color: isAnnual ? "#FFFFFF" : colors.textSecondary }
          ]}>
            Pay annually
          </Text>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>2 months free</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(Object.keys(planDetails) as PlanType[]).map(renderPlanCard)}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "transparent",
  },
  currentPlanCard: {
    borderColor: "#1AC6C6",
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
  },
  priceUnit: {
    fontSize: 16,
  },
  billingNote: {
    fontSize: 12,
    marginTop: 4,
  },
  billingToggle: {
    flexDirection: "row",
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  activeToggle: {
    backgroundColor: "#1AC6C6",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  savingsBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingsText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  planDetails: {
    marginBottom: 24,
  },
  seatLimit: {
    fontSize: 16,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  currentButton: {
    backgroundColor: "#9CA3AF",
  },
  freeButton: {
    backgroundColor: "#9CA3AF",
  },
  enterpriseButton: {
    backgroundColor: "#0B1F3B",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  currentButtonText: {
    color: "#FFFFFF",
  },
  freeButtonText: {
    color: "#FFFFFF",
  },
  contactSalesContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactSalesText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});