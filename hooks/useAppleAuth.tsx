import * as AppleAuthentication from "expo-apple-authentication";
import { useState, useEffect } from "react";

export const useAppleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      if (credential.email) {
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        setError("Sign-in was canceled");
      } else {
        setError("An error occurred during sign-in");
      }
    }
  };

  useEffect(() => {
    const checkAvailability = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        setIsAuthenticated(true); // Skip authentication if not available
      }
      setIsLoading(false);
    };

    checkAvailability();
  }, []);

  return { isAuthenticated, isLoading, error, signIn };
};
