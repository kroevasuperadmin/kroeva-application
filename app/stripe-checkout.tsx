import { useSettings } from "@/providers/settings-provider";
import { PlanType, useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { CreditCard, Lock, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StripeCheckoutScreen() {
  const { colors } = useTheme();
  const { planDetails, setCurrentPlan } = useSubscription();
  const { currency } = useSettings();
  const { plan } = useLocalSearchParams<{ plan: PlanType }>();
  const insets = useSafeAreaInsets();

  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [email, setEmail] = useState("admin@acme.com");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = plan ? planDetails[plan] : null;

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !plan) return;

    setIsProcessing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentPlan(plan);
      
      if (Platform.OS === "web") {
        console.log("Payment simulated – full features unlocked");
      } else {
        Alert.alert(
          "Success!",
          "Payment simulated – full features unlocked",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }
      router.back();
    }, 2000);
  };

  const formatPrice = (price: number) => {
    const convertedPrice = currency === "USD" ? Math.round(price * 0.22) : price;
    return `${currency} ${convertedPrice}`;
  };

  if (!selectedPlan || !plan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Invalid plan selected
        </Text>
      </View>
    );
  }

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
          Stripe Checkout
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Plan Summary */}
        <View style={[styles.planSummary, { backgroundColor: colors.card }]}>
          <Text style={[styles.planSummaryTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          <View style={styles.planSummaryRow}>
            <Text style={[styles.planSummaryLabel, { color: colors.textSecondary }]}>
              {selectedPlan.name} Plan
            </Text>
            <Text style={[styles.planSummaryValue, { color: colors.text }]}>
              {formatPrice(selectedPlan.price)}/seat
            </Text>
          </View>
          <View style={styles.planSummaryRow}>
            <Text style={[styles.planSummaryLabel, { color: colors.textSecondary }]}>
              Estimated monthly (200 seats)
            </Text>
            <Text style={[styles.planSummaryValue, { color: colors.text }]}>
              {formatPrice(selectedPlan.price * 200)}
            </Text>
          </View>
        </View>

        {/* Payment Form */}
        <View style={[styles.paymentForm, { backgroundColor: colors.card }]}>
          <View style={styles.formHeader}>
            <CreditCard size={20} color="#1AC6C6" />
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Payment Details
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Card Number
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Expiry Date
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                CVV
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Lock size={16} color="#4CAF50" />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Your payment information is secure and encrypted
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isProcessing ? "Processing..." : `Subscribe to ${selectedPlan.name}`}
          </Text>
        </TouchableOpacity>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={[styles.demoText, { color: colors.textSecondary }]}>
            This is a demo checkout. No real payment will be processed.
          </Text>
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
    gap: 20,
  },
  planSummary: {
    borderRadius: 12,
    padding: 20,
  },
  planSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  planSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planSummaryLabel: {
    fontSize: 14,
  },
  planSummaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  paymentForm: {
    borderRadius: 12,
    padding: 20,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  securityText: {
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoNotice: {
    alignItems: "center",
    paddingVertical: 16,
  },
  demoText: {
    fontSize: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});