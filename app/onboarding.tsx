import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ArrowRight,
    Building2,
    Check,
    Chrome,
    Upload,
    X
} from "lucide-react-native";
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

type ConnectionStatus = 'idle' | 'connecting' | 'connected';

interface ConnectionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  status: ConnectionStatus;
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [connections, setConnections] = useState<ConnectionCard[]>([
    {
      id: 'bank',
      title: 'Connect Bank',
      description: 'Link your bank account to track software expenses automatically',
      icon: <Building2 size={32} color="#1AC6C6" />,
      buttonText: 'Connect Bank Account',
      status: 'idle'
    },
    {
      id: 'sso',
      title: 'Connect Google / Microsoft',
      description: 'Sync your workspace accounts to discover all software subscriptions',
      icon: <Chrome size={32} color="#4285F4" />,
      buttonText: 'Connect SSO',
      status: 'idle'
    },
    {
      id: 'csv',
      title: 'Or upload CSV',
      description: 'Upload your existing software inventory as a CSV file',
      icon: <Upload size={32} color="#10B981" />,
      buttonText: 'Upload CSV File',
      status: 'idle'
    }
  ]);

  const updateConnectionStatus = (id: string, status: ConnectionStatus) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, status } : conn
    ));
  };

  const handleBankConnect = () => {
    updateConnectionStatus('bank', 'connecting');
    setTimeout(() => {
      updateConnectionStatus('bank', 'connected');
    }, 2000);
  };

  const handleSSOConnect = () => {
    updateConnectionStatus('sso', 'connecting');
    setTimeout(() => {
      updateConnectionStatus('sso', 'connected');
    }, 2000);
  };

  const handleCSVUpload = () => {
    updateConnectionStatus('csv', 'connecting');
    setTimeout(() => {
      updateConnectionStatus('csv', 'connected');
    }, 2000);
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)/dashboard');
  };

  const hasAnyConnection = connections.some(conn => conn.status === 'connected');

  React.useEffect(() => {
    if (hasAnyConnection) {
      const timer = setTimeout(() => {
        completeOnboarding();
        router.replace('/(tabs)/dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasAnyConnection, completeOnboarding]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#0B1F3B", "#1A3A5C"]}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <X size={20} color="#FFFFFF" />
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Let&apos;s get you set up</Text>
            <Text style={styles.subtitle}>
              Connect your data sources to start tracking software waste
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {connections.map((connection, index) => (
              <View key={connection.id} style={styles.cardWrapper}>
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      {connection.status === 'connected' ? (
                        <View style={styles.successIcon}>
                          <Check size={32} color="#FFFFFF" />
                        </View>
                      ) : (
                        connection.icon
                      )}
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {connection.title}
                      </Text>
                      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                        {connection.description}
                      </Text>
                    </View>
                  </View>

                  {connection.status === 'connected' ? (
                    <View style={styles.connectedBadge}>
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.connectedText}>Connected</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.connectButton,
                        connection.status === 'connecting' && styles.connectingButton
                      ]}
                      onPress={() => {
                        if (connection.id === 'bank') handleBankConnect();
                        else if (connection.id === 'sso') handleSSOConnect();
                        else if (connection.id === 'csv') handleCSVUpload();
                      }}
                      disabled={connection.status === 'connecting'}
                    >
                      <Text style={styles.connectButtonText}>
                        {connection.status === 'connecting' ? 'Connecting...' : connection.buttonText}
                      </Text>
                      {connection.status === 'idle' && (
                        <ArrowRight size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                
                {index < connections.length - 1 && (
                  <View style={styles.orDivider}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.orLine} />
                  </View>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleSkip}
          >
            <Text style={styles.laterText}>I&apos;ll do this later</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 50,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#B4F14C",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    gap: 0,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 4,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: "#1AC6C6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectingButton: {
    backgroundColor: "#94A3B8",
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  connectedBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  laterButton: {
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
  },
  laterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});