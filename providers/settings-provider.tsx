import { useStorage } from "@/providers/storage-provider";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SettingsState {
  currency: "RM" | "USD";
  setCurrency: (currency: "RM" | "USD") => void;
  companyLogo: string | null;
  setCompanyLogo: (logo: string) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  aiFlowsEnabled: boolean;
  setAiFlowsEnabled: (enabled: boolean) => void;
  devModeEnabled: boolean;
  setDevModeEnabled: (enabled: boolean) => void;
}

export const [SettingsProvider, useSettings] = createContextHook<SettingsState>(() => {
  const [currency, setCurrencyState] = useState<"RM" | "USD">("RM");
  const [companyLogo, setCompanyLogoState] = useState<string | null>(null);
  const [notifications, setNotificationsState] = useState(true);
  const [aiFlowsEnabled, setAiFlowsEnabledState] = useState(false);
  const [devModeEnabled, setDevModeEnabledState] = useState(true);
  const { getItem, setItem } = useStorage();

  const loadSettings = useCallback(async () => {
    try {
      const settings = await getItem("settings");
      if (settings && typeof settings === 'string' && settings.trim()) {
        try {
          const parsed = JSON.parse(settings);
          if (parsed && typeof parsed === 'object') {
            setCurrencyState(parsed.currency === "USD" ? "USD" : "RM");
            setCompanyLogoState(parsed.companyLogo || null);
            setNotificationsState(parsed.notifications ?? true);
            setAiFlowsEnabledState(parsed.aiFlowsEnabled ?? false);
            setDevModeEnabledState(parsed.devModeEnabled ?? true);
          }
        } catch (parseError) {
          console.error("Failed to parse settings data, using defaults:", parseError);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, [getItem]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (newSettings: any) => {
    try {
      const current = await getItem("settings");
      let parsed = {};
      
      if (current && typeof current === 'string' && current.trim()) {
        try {
          parsed = JSON.parse(current);
          if (!parsed || typeof parsed !== 'object') {
            parsed = {};
          }
        } catch (parseError) {
          console.error("Failed to parse existing settings, using defaults:", parseError);
          parsed = {};
        }
      }
      
      await setItem(
        "settings",
        JSON.stringify({ ...parsed, ...newSettings })
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [getItem, setItem]);

  const setCurrency = useCallback((newCurrency: "RM" | "USD") => {
    if (!newCurrency || (newCurrency !== "RM" && newCurrency !== "USD")) return;
    setCurrencyState(newCurrency);
    saveSettings({ currency: newCurrency });
  }, [saveSettings]);

  const setCompanyLogo = useCallback((logo: string) => {
    if (!logo || typeof logo !== "string" || logo.length > 10000) return;
    setCompanyLogoState(logo);
    saveSettings({ companyLogo: logo });
  }, [saveSettings]);

  const setNotifications = useCallback((enabled: boolean) => {
    if (typeof enabled !== "boolean") return;
    setNotificationsState(enabled);
    saveSettings({ notifications: enabled });
  }, [saveSettings]);

  const setAiFlowsEnabled = useCallback((enabled: boolean) => {
    if (typeof enabled !== "boolean") return;
    console.log('Settings: setAiFlowsEnabled called with:', enabled);
    setAiFlowsEnabledState(enabled);
    saveSettings({ aiFlowsEnabled: enabled });
  }, [saveSettings]);

  const setDevModeEnabled = useCallback((enabled: boolean) => {
    if (typeof enabled !== "boolean") return;
    setDevModeEnabledState(enabled);
    saveSettings({ devModeEnabled: enabled });
  }, [saveSettings]);

  return useMemo(() => ({
    currency,
    setCurrency,
    companyLogo,
    setCompanyLogo,
    notifications,
    setNotifications,
    aiFlowsEnabled,
    setAiFlowsEnabled,
    devModeEnabled,
    setDevModeEnabled,
  }), [currency, setCurrency, companyLogo, setCompanyLogo, notifications, setNotifications, aiFlowsEnabled, setAiFlowsEnabled, devModeEnabled, setDevModeEnabled]);
});