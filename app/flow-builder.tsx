import { useSettings } from "@/providers/settings-provider";
import { useSubscription } from "@/providers/subscription-provider";
import { useTheme } from "@/providers/theme-provider";
import { router } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    Database,
    FileText,
    Mail,
    Plus,
    Slack,
    Users,
    X
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SaaSApp {
  id: string;
  name: string;
  icon: (color: string) => React.ReactNode;
  color: string;
}

const saasApps: SaaSApp[] = [
  { id: "slack", name: "Slack", icon: (color) => <Slack size={24} color={color} />, color: "#4A154B" },
  { id: "drive", name: "Google Drive", icon: (color) => <FileText size={24} color={color} />, color: "#4285F4" },
  { id: "salesforce", name: "Salesforce", icon: (color) => <Database size={24} color={color} />, color: "#00A1E0" },
  { id: "hubspot", name: "HubSpot", icon: (color) => <Users size={24} color={color} />, color: "#FF7A59" },
  { id: "gmail", name: "Gmail", icon: (color) => <Mail size={24} color={color} />, color: "#EA4335" },
  { id: "calendar", name: "Google Calendar", icon: (color) => <Calendar size={24} color={color} />, color: "#34A853" },
];

export default function FlowBuilderScreen() {
  const { colors } = useTheme();
  const { aiFlowsEnabled, devModeEnabled } = useSettings();
  const { currentPlan } = useSubscription();
  const insets = useSafeAreaInsets();
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDummyFlow, setShowDummyFlow] = useState(false);

  const isPaidPlan = currentPlan !== "free";
  const canGenerate = devModeEnabled && workflowDescription.trim().length >= 10;
  const canSave = devModeEnabled;

  const handleBack = () => {
    router.back();
  };

  const handleGenerateFlow = () => {
    if (!devModeEnabled) {
      setShowTooltip(true);
      return;
    }
    
    if (workflowDescription.trim().length < 10) {
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      setShowDummyFlow(true);
    }, 2000);
  };

  const handleSaveFlow = () => {
    if (!devModeEnabled) {
      setShowTooltip(true);
      return;
    }

    if (Platform.OS === "web") {
      console.log('Flow saved (demo only)');
    } else {
      Alert.alert(
        "Success!",
        "Flow saved (demo only)",
        [{ text: "OK" }]
      );
    }
  };

  if (!aiFlowsEnabled) {
    router.back();
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Flow Builder
        </Text>
        <View style={styles.headerRight} />
      </View>

      {!isPaidPlan && (
        <View style={styles.betaBanner}>
          <Text style={styles.betaBannerText}>
            Beta access – subscribe to enable creation
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Apps
          </Text>
          <View style={styles.appsGrid}>
            {saasApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[styles.appCard, { backgroundColor: colors.card }]}
                disabled={true}
              >
                <View style={[styles.appIcon, { backgroundColor: `${app.color}15` }]}>
                  {app.icon(colors.text)}
                </View>
                <Text style={[styles.appName, { color: colors.text }]}>
                  {app.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Workflow Canvas
          </Text>
          <View style={[styles.canvas, { backgroundColor: colors.card }]}>
            <View style={styles.canvasGrid}>
              {Array.from({ length: 24 }).map((_, index) => (
                <View
                  key={`grid-cell-${index}`}
                  style={[styles.gridCell, { borderColor: colors.border }]}
                />
              ))}
            </View>
            <View style={styles.canvasOverlay}>
              {showDummyFlow ? (
                <View style={styles.dummyFlow}>
                  <View style={[styles.flowNode, { backgroundColor: "#4A154B" }]}>
                    <Text style={styles.flowNodeText}>Slack</Text>
                  </View>
                  <View style={styles.flowArrow}>
                    <Text style={[styles.arrowText, { color: colors.text }]}>→</Text>
                  </View>
                  <View style={[styles.flowNode, { backgroundColor: "#4285F4" }]}>
                    <Text style={styles.flowNodeText}>Drive</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={[styles.canvasPlaceholder, { color: colors.textSecondary }]}>
                    Drag apps here to build your workflow
                  </Text>
                  <Plus size={32} color={colors.textSecondary} />
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Describe Your Workflow
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Describe workflow in plain English"
              placeholderTextColor={colors.textSecondary}
              value={workflowDescription}
              onChangeText={setWorkflowDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.generateButton, 
              !canGenerate && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateFlow}
            disabled={isGenerating}
          >
            <Text style={
              canGenerate ? 
              styles.generateButtonText : 
              styles.generateButtonTextDisabled
            }>
              {isGenerating ? "Generating..." : "Generate Flow"}
            </Text>
            {!devModeEnabled && (
              <View style={styles.upgradeBadge}>
                <Text style={styles.upgradeBadgeText}>Subscribe to unlock</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {showDummyFlow && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !canSave && styles.saveButtonDisabled
              ]}
              onPress={handleSaveFlow}
              disabled={!canSave}
            >
              <Text style={styles.saveButtonText}>Save Flow</Text>
              {!devModeEnabled && (
                <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeBadgeText}>Subscribe to unlock</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showTooltip}
        onRequestClose={() => setShowTooltip(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.tooltipContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTooltip(false)}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.tooltipContent}>
              <View style={styles.tooltipArrow} />
              <Text style={[styles.tooltipText, { color: colors.text }]}>
                Subscribe to unlock AI flow creation
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  betaBanner: {
    backgroundColor: "#C6F04C",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  betaBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1F3B",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  appsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  appCard: {
    width: "30%",
    minWidth: 100,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    opacity: 0.7,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  canvas: {
    height: 200,
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  canvasGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: "16.666%",
    height: "25%",
    borderWidth: 0.5,
    borderColor: "#F0F0F0",
  },
  canvasOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  canvasPlaceholder: {
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    minHeight: 80,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "#1AC6C6",
    position: "relative",
  },
  generateButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  generateButtonTextDisabled: {
    color: "#999999",
    fontSize: 16,
    fontWeight: "600",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  tooltipContainer: {
    borderRadius: 12,
    padding: 20,
    maxWidth: 280,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  tooltipContent: {
    alignItems: "center",
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#B4F14C",
    marginBottom: 8,
  },
  tooltipText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  dummyFlow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  flowNode: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  flowNodeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  flowArrow: {
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
