import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from "react-native-health";

type HealthDataContextType = {
  dailyActiveEnergyBurned: number;
  lastWeight: number;
  lastBodyFat: number;
  fetchDailyActiveEnergyBurned: () => void;
  fetchLatestWeight: () => void;
  fetchLatestBodyFatPercentage: () => void;
  saveFoodData: (options: Object) => void;
};

const defaultContext: HealthDataContextType = {
  dailyActiveEnergyBurned: 0,
  lastWeight: 0,
  lastBodyFat: 0,
  fetchDailyActiveEnergyBurned: () => {},
  fetchLatestWeight: () => {},
  fetchLatestBodyFatPercentage: () => {},
  saveFoodData: () => {},
};

export const HealthDataContext =
  createContext<HealthDataContextType>(defaultContext);

type HealthDataProviderProps = {
  children: ReactNode;
};

export const HealthDataProvider: React.FC<HealthDataProviderProps> = ({
  children,
}) => {
  const [dailyActiveEnergyBurned, setDailyActiveEnergyBurned] =
    useState<number>(0);
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [lastBodyFat, setLastBodyFat] = useState<number | null>(null);

  useEffect(() => {
    initHealthKit();
  }, []);

  const initHealthKit = () => {
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.BodyFatPercentage,
          AppleHealthKit.Constants.Permissions.Weight,
        ],
        write: [AppleHealthKit.Constants.Permissions.EnergyConsumed],
      },
    } as HealthKitPermissions;

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error("[ERROR] Cannot grant permissions:", error);
      } else {
        fetchDailyActiveEnergyBurned();
        fetchLatestWeight();
        fetchLatestBodyFatPercentage();
      }
    });
  };

  const fetchLatestWeight = () => {
    AppleHealthKit.getLatestWeight(
      { unit: "gram" } as any,
      (err: string, results: HealthValue) => {
        if (err) {
          console.error("Error getting latest weight:", err);
          setLastWeight(null);
        } else {
          setLastWeight(results.value);
        }
      }
    );
  };

  const fetchLatestBodyFatPercentage = () => {
    AppleHealthKit.getLatestBodyFatPercentage(
      null,
      (err: string, results: HealthValue) => {
        if (err) {
          console.log("Error getting latest body fat percentage:", err);
          setLastBodyFat(null);
        } else {
          setLastBodyFat(results.value);
        }
      }
    );
  };

  const fetchDailyActiveEnergyBurned = () => {
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const options = {
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      ascending: true,
      includeManuallyAdded: true,
    };

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (error: string, results: HealthValue[]) => {
        if (error) {
          console.error("Error fetching active energy burned data:", error);
        } else {
          const totalEnergyBurned = results.reduce(
            (sum, item) => sum + item.value,
            0
          );
          setDailyActiveEnergyBurned(totalEnergyBurned);
        }
      }
    );
  };

  const saveFoodData = (options: Object) => {
    AppleHealthKit.saveFood(options, (error: string, result: HealthValue) => {
      if (error) {
        console.error("Error saving food to HealthKit:", error);
      } else {
        console.log("Food saved successfully:", result);
      }
    });
  };

  return (
    <HealthDataContext.Provider
      value={{
        dailyActiveEnergyBurned,
        lastWeight,
        lastBodyFat,
        fetchDailyActiveEnergyBurned,
        fetchLatestWeight,
        fetchLatestBodyFatPercentage,
        saveFoodData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => useContext(HealthDataContext);
