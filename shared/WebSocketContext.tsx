import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { setLastSyncTimestamp } from "../utils/storage";

type WebSocketMessage = {
  meal_id: string;
  event: "analysis_complete" | "analysis_failed";
  data?: any;
  error?: string;
};

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { jwt } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!jwt) {
      if (ws.current) {
        setLastSyncTimestamp(new Date().toISOString());
        ws.current.close();
        ws.current = null;
      }
      setIsConnected(false);
      return;
    }

    const connect = () => {
      ws.current = new WebSocket(`wss://api.calorily.com/ws?token=${jwt}`);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [jwt]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
