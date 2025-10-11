import { useStorage } from "@/providers/storage-provider";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  user: {
    email: string;
    name: string;
  } | null;
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [user, setUser] = useState<AuthState["user"]>(null);
  const { getItem, setItem, removeItem } = useStorage();

  const loadAuthState = useCallback(async () => {
    try {
      const authData = await getItem("auth");
      if (authData && typeof authData === 'string' && authData.trim()) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed && typeof parsed === 'object') {
            setIsAuthenticated(Boolean(parsed.isAuthenticated));
            setIsOnboardingComplete(Boolean(parsed.isOnboardingComplete));
            setUser(parsed.user || null);
          }
        } catch (parseError) {
          console.error("Failed to parse auth data, resetting:", parseError);
          await removeItem("auth");
        }
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    }
  }, [getItem, removeItem]);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const login = useCallback(async () => {
    const userData = {
      email: "admin@acme.com",
      name: "Admin User",
    };
    
    setIsAuthenticated(true);
    setUser(userData);
    
    await setItem(
      "auth",
      JSON.stringify({ isAuthenticated: true, isOnboardingComplete: false, user: userData })
    );
  }, [setItem]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setIsOnboardingComplete(false);
    setUser(null);
    await removeItem("auth");
  }, [removeItem]);

  const completeOnboarding = useCallback(async () => {
    setIsOnboardingComplete(true);
    const currentAuth = await getItem("auth");
    if (currentAuth) {
      try {
        const parsed = JSON.parse(currentAuth);
        await setItem(
          "auth",
          JSON.stringify({ ...parsed, isOnboardingComplete: true })
        );
      } catch (error) {
        console.error("Failed to update onboarding status:", error);
      }
    }
  }, [getItem, setItem]);

  return useMemo(() => ({
    isAuthenticated,
    isOnboardingComplete,
    user,
    login,
    logout,
    completeOnboarding,
  }), [isAuthenticated, isOnboardingComplete, user, login, logout, completeOnboarding]);
});