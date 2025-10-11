import { useAuth } from "@/providers/auth-provider";
import { useSettings } from "@/providers/settings-provider";
import { useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
    Bell,
    ChevronDown,
    Code,
    Crown,
    DollarSign,
    Download,
    HelpCircle,
    LogOut,
    Moon,
    Shield,
    Sun,
    Upload,
    X,
    Zap
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { currency, setCurrency, companyLogo, setCompanyLogo, notifications, setNotifications, aiFlowsEnabled, setAiFlowsEnabled, devModeEnabled, setDevModeEnabled } = useSettings();
  const { logout } = useAuth();
  const { currentPlan, planDetails, invoices } = useSubscription();
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "billing">("general");
  const insets = useSafeAreaInsets();

  const handleCurrencyToggle = () => {
    setCurrency(currency === "RM" ? "USD" : "RM");
  };

  const handleLogoUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      console.log("Permission required to access photo library");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        setCompanyLogo(result.assets[0].uri);
        setIsUploading(false);
        setShowSuccessModal(true);
      }, 1000);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace("/login");
  };

  const handleSaveChanges = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleUpgradePlan = () => {
    setShowProfileDropdown(false);
    router.push("/subscription-plans");
  };

  const handleDownloadInvoice = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open invoice URL:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === "USD" ? Math.round(amount * 0.22) : amount;
    return `${currency} ${convertedAmount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.content}>
        {/* Master Logo */}
        <View style={styles.masterLogoContainer}>
          <Image 
            source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/k77a9kilini42z99kdaqr" }}
            style={styles.masterLogo}
            resizeMode="contain"
          />
        </View>

        {/* Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={handleLogoUpload}
            disabled={isUploading}
          >
            {companyLogo ? (
              <Image source={{ uri: companyLogo }} style={styles.companyLogo} />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.background }]}>
                <Upload size={32} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.uploadBadge}>
              <Upload size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.companyName, { color: colors.text }]}>
            Acme Corporation
          </Text>
          <Text style={[styles.companyEmail, { color: colors.textSecondary }]}>
            admin@acme.com
          </Text>
          
          {/* Profile Dropdown */}
          <TouchableOpacity
            style={styles.profileDropdownButton}
            onPress={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <Text style={[styles.currentPlanText, { color: colors.textSecondary }]}>
              {planDetails[currentPlan].name} Plan
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {showProfileDropdown && (
            <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleUpgradePlan}
              >
                <Crown size={16} color="#1AC6C6" />
                <Text style={[styles.dropdownText, { color: colors.text }]}>
                  Upgrade Plan
                </Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}
              >
                <LogOut size={16} color="#FF4444" />
                <Text style={[styles.dropdownText, { color: "#FF4444" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "general" && styles.activeTab
            ]}
            onPress={() => setActiveTab("general")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "general" ? "#FFFFFF" : colors.textSecondary }
              ]}
            >
              General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "billing" && styles.activeTab
            ]}
            onPress={() => setActiveTab("billing")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "billing" ? "#FFFFFF" : colors.textSecondary }
              ]}
            >
              Billing
            </Text>
          </TouchableOpacity>
        </View>

        {/* General Tab Content */}
        {activeTab === "general" && (
          <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={toggleDarkMode}
            >
              <View style={styles.settingLeft}>
                {isDarkMode ? (
                  <Moon size={20} color="#1AC6C6" />
                ) : (
                  <Sun size={20} color="#1AC6C6" />
                )}
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#E0E0E0", true: "#1AC6C6" }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleCurrencyToggle}
            >
              <View style={styles.settingLeft}>
                <DollarSign size={20} color="#1AC6C6" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Currency
                </Text>
              </View>
              <View style={styles.currencyToggle}>
                <TouchableOpacity
                  style={[
                    styles.currencyOption,
                    currency === "RM" && styles.currencyActive
                  ]}
                  onPress={() => setCurrency("RM")}
                >
                  <Text
                    style={[
                      styles.currencyText,
                      { color: currency === "RM" ? "#FFFFFF" : colors.textSecondary }
                    ]}
                  >
                    RM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.currencyOption,
                    currency === "USD" && styles.currencyActive
                  ]}
                  onPress={() => setCurrency("USD")}
                >
                  <Text
                    style={[
                      styles.currencyText,
                      { color: currency === "USD" ? "#FFFFFF" : colors.textSecondary }
                    ]}
                  >
                    USD
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setNotifications(!notifications)}
            >
              <View style={styles.settingLeft}>
                <Bell size={20} color="#1AC6C6" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#E0E0E0", true: "#1AC6C6" }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setAiFlowsEnabled(!aiFlowsEnabled)}
            >
              <View style={styles.settingLeft}>
                <Zap size={20} color="#1AC6C6" />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Enable AI Flows (Beta)
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    Automate workflows with AI
                  </Text>
                </View>
              </View>
              <Switch
                value={aiFlowsEnabled}
                onValueChange={setAiFlowsEnabled}
                trackColor={{ false: "#E0E0E0", true: "#1AC6C6" }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setDevModeEnabled(!devModeEnabled)}
            >
              <View style={styles.settingLeft}>
                <Code size={20} color="#1AC6C6" />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Dev Mode
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    Unlocks Create Flow for demo
                  </Text>
                </View>
              </View>
              <Switch
                value={devModeEnabled}
                onValueChange={setDevModeEnabled}
                trackColor={{ false: "#E0E0E0", true: "#1AC6C6" }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          </View>
        )}

        {/* Billing Tab Content */}
        {activeTab === "billing" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Plan
            </Text>
            <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: colors.text }]}>
                  {planDetails[currentPlan].name} Plan
                </Text>
                <Text style={[styles.planPrice, { color: colors.textSecondary }]}>
                  {currentPlan === "free" ? "Free" : `${formatCurrency(planDetails[currentPlan].price)}/seat`}
                </Text>
              </View>
              {currentPlan === "free" && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgradePlan}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Invoice History
            </Text>
            <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
              {invoices.map((invoice, index) => (
                <View key={invoice.id}>
                  <View style={styles.invoiceItem}>
                    <View style={styles.invoiceInfo}>
                      <Text style={[styles.invoiceId, { color: colors.text }]}>
                        {invoice.id}
                      </Text>
                      <Text style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                        {formatDate(invoice.date)} • {formatCurrency(invoice.amount)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownloadInvoice(invoice.downloadUrl)}
                    >
                      <Download size={16} color="#1AC6C6" />
                    </TouchableOpacity>
                  </View>
                  {index < invoices.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Support */}
        {activeTab === "general" && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Support
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Shield size={20} color="#1AC6C6" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Privacy Policy
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color="#1AC6C6" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Help Center
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          </View>
        )}

        {/* Logout Button */}
        {activeTab === "general" && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* Save Changes Button */}
        {activeTab === "general" && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Version */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLogoutModal(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Logout
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutConfirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutConfirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Success
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Company logo updated successfully!
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.successButton]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save Toast */}
      {showSaveToast && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, { backgroundColor: "#4CAF50" }]}>
            <Text style={styles.toastText}>Settings saved</Text>
          </View>
        </View>
      )}
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
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 16,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    padding: 6,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    padding: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  currencyToggle: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 2,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  currencyActive: {
    backgroundColor: "#1AC6C6",
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF4444",
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4444",
  },
  saveButton: {
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
  },
  masterLogoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  masterLogo: {
    width: 200,
    height: 60,
  },
  toastContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  toast: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
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
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#333333",
    fontWeight: "600",
  },
  logoutConfirmButton: {
    backgroundColor: "#FF4444",
  },
  logoutConfirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  successButton: {
    backgroundColor: "#1AC6C6",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  profileDropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(26, 198, 198, 0.1)",
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: 180,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#1AC6C6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 14,
  },
  upgradeButton: {
    backgroundColor: "#1AC6C6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  invoiceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceId: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
  },
  downloadButton: {
    padding: 8,
  },
});