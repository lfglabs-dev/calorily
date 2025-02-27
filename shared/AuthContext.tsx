import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as AppleAuthentication from "expo-apple-authentication";

interface JWTPayload {
  exp: number;
  user_id: string;
}

function decodeJWT(token: string): JWTPayload {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error("Invalid token format");
  }
}

interface AuthContextType {
  jwt: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const JWT_KEY = "calorily_jwt";

export function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    const isValid = decoded.exp * 1000 > Date.now();
    return isValid;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJWT();
  }, []);

  const loadJWT = async () => {
    try {
      const token = await AsyncStorage.getItem(JWT_KEY);
      if (token && isTokenValid(token)) {
        setJwt(token);
      } else if (token) {
        // Token exists but is invalid, remove it
        await AsyncStorage.removeItem(JWT_KEY);
        setJwt(null);
      }
    } catch (error) {
      console.error("Error loading JWT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string) => {
    if (!token) {
      throw new Error("Cannot save empty token");
    }

    try {
      await AsyncStorage.setItem(JWT_KEY, token);
      setJwt(token);
    } catch (error) {
      console.error("Error saving JWT:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(JWT_KEY);
      setJwt(null);
    } catch (error) {
      console.error("Error removing JWT:", error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      console.log("Attempting to refresh token with Apple Sign In");

      // Request a new identity token from Apple
      const appleAuthCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!appleAuthCredential.identityToken) {
        throw new Error("Failed to get Apple identity token");
      }

      // Call your auth/apple endpoint with the new identity token
      const response = await fetch("https://api.calorily.com/auth/apple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity_token: appleAuthCredential.identityToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Token refresh failed:", errorText);
        throw new Error("Failed to refresh token");
      }

      const { jwt: newToken } = await response.json();

      // Save the new token
      await AsyncStorage.setItem(JWT_KEY, newToken);
      setJwt(newToken);

      console.log("Token refreshed successfully");
      return newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      // If refresh fails, sign out
      await signOut();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        jwt,
        isLoading,
        signIn,
        signOut,
        refreshToken,
        isAuthenticated: !!jwt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
