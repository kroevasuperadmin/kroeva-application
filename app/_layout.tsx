import { AuthProvider } from "@/providers/auth-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { StorageProvider } from "@/providers/storage-provider";
import { SubscriptionProvider } from "@/providers/subscription-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { Component, ReactNode, useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="flow-builder" options={{ presentation: "modal" }} />
      <Stack.Screen name="app-detail" options={{ presentation: "modal" }} />
      <Stack.Screen name="renewal-detail" options={{ presentation: "modal" }} />
      <Stack.Screen name="subscription-plans" options={{ presentation: "modal" }} />
      <Stack.Screen name="stripe-checkout" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Failed to hide splash screen:', error);
      }
    };
    
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      const shouldSuppressMessage = (message: string) => {
        return (
          message.includes('MetaMask') ||
          message.includes('ethereum') ||
          message.includes('chrome-extension') ||
          message.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
          message.includes('Failed to connect to MetaMask')
        );
      };
      
      console.error = (...args: any[]) => {
        const errorMessage = args.join(' ');
        if (shouldSuppressMessage(errorMessage)) {
          return;
        }
        originalError.apply(console, args);
      };
      
      console.warn = (...args: any[]) => {
        const warnMessage = args.join(' ');
        if (shouldSuppressMessage(warnMessage)) {
          return;
        }
        originalWarn.apply(console, args);
      };

      window.addEventListener('error', (event) => {
        if (
          event.message?.includes('MetaMask') ||
          event.message?.includes('ethereum') ||
          event.filename?.includes('chrome-extension') ||
          event.filename?.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
        ) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }, true);

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason?.message || String(event.reason);
        if (shouldSuppressMessage(reason)) {
          event.preventDefault();
          return false;
        }
      }, true);
    }
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <StorageProvider>
            <ThemeProvider>
              <SettingsProvider>
                <SubscriptionProvider>
                  <AuthProvider>
                    <RootLayoutNav />
                  </AuthProvider>
                </SubscriptionProvider>
              </SettingsProvider>
            </ThemeProvider>
          </StorageProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});