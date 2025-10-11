import { useStorage } from "@/providers/storage-provider";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

export type PlanType = "free" | "growth" | "scale" | "enterprise";

interface PlanDetails {
  name: string;
  price: number;
  maxSeats: number;
  features: string[];
  color: string;
}

interface SubscriptionState {
  currentPlan: PlanType;
  setCurrentPlan: (plan: PlanType) => void;
  planDetails: Record<PlanType, PlanDetails>;
  isFeatureEnabled: (feature: string) => boolean;
  monthlySavings: number;
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    downloadUrl: string;
  }>;
}

export const [SubscriptionProvider, useSubscription] = createContextHook<SubscriptionState>(() => {
  const [currentPlan, setCurrentPlanState] = useState<PlanType>("free");
  const { getItem, setItem } = useStorage();

  const planDetails: Record<PlanType, PlanDetails> = {
    free: {
      name: "Free",
      price: 0,
      maxSeats: 50,
      features: ["Waste scan only", "Basic reporting"],
      color: "#9CA3AF"
    },
    growth: {
      name: "Growth",
      price: 12,
      maxSeats: 250,
      features: ["Full cancel", "500 AI flows", "Advanced analytics"],
      color: "#1AC6C6"
    },
    scale: {
      name: "Scale",
      price: 9,
      maxSeats: 1000,
      features: ["SSO integration", "5k AI flows", "Priority support"],
      color: "#1AC6C6"
    },
    enterprise: {
      name: "Enterprise",
      price: 6,
      maxSeats: -1, // unlimited
      features: ["12% savings guarantee", "Unlimited flows", "Dedicated support"],
      color: "#0B1F3B"
    }
  };

  const monthlySavings = 18450;

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: 2400,
      status: "Paid",
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "INV-2023-012",
      date: "2023-12-15",
      amount: 2400,
      status: "Paid",
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "INV-2023-011",
      date: "2023-11-15",
      amount: 2400,
      status: "Paid",
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ];

  const loadSubscription = useCallback(async () => {
    try {
      const subscription = await getItem("subscription");
      if (subscription && typeof subscription === 'string' && subscription.trim()) {
        try {
          const parsed = JSON.parse(subscription);
          if (parsed && typeof parsed === 'object' && parsed.currentPlan) {
            setCurrentPlanState(parsed.currentPlan);
          }
        } catch (parseError) {
          console.error("Failed to parse subscription data, using defaults:", parseError);
        }
      }
    } catch (error) {
      console.error("Failed to load subscription:", error);
    }
  }, [getItem]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const setCurrentPlan = useCallback(async (plan: PlanType) => {
    if (!plan || !planDetails[plan]) return;
    setCurrentPlanState(plan);
    try {
      await setItem("subscription", JSON.stringify({ currentPlan: plan }));
    } catch (error) {
      console.error("Failed to save subscription:", error);
    }
  }, [setItem]);

  const isFeatureEnabled = useCallback((feature: string) => {
    if (currentPlan === "free") return false;
    return true;
  }, [currentPlan]);

  return useMemo(() => ({
    currentPlan,
    setCurrentPlan,
    planDetails,
    isFeatureEnabled,
    monthlySavings,
    invoices,
  }), [currentPlan, setCurrentPlan, isFeatureEnabled]);
});