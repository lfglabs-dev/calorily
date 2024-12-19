import { createContext, useContext } from "react";
import { PurchasesPackage } from "react-native-purchases";

type SubscriptionContextType = {
  handleSubscribe: (pkg: PurchasesPackage) => Promise<void>;
  setIsSubscribed: (value: boolean) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

type SubscriptionProviderProps = SubscriptionContextType & {
  children: React.ReactNode;
};

export const SubscriptionProvider = ({
  children,
  handleSubscribe,
  setIsSubscribed,
}: SubscriptionProviderProps) => (
  <SubscriptionContext.Provider value={{ handleSubscribe, setIsSubscribed }}>
    {children}
  </SubscriptionContext.Provider>
);

export const useSubscription = () => useContext(SubscriptionContext);
