import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { Platform, AppState } from "react-native";
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from "react-native-health";

type HeightResponse = {
  value: number;
  startDate: string;
  endDate: string;
};
type BiologicalSexResponse = { value: "female" | "male" };
type DateOfBirthResponse = { age: number };

type HealthDataContextType = {
  weeklyActivity: {
    value: number;
    startDate: string;
    endDate: string;
  }[];
  dailyActiveEnergyBurned: number;
  lastWeightDate: Date | null;
  lastWeight: number;
  lastBodyFat: number;
  refreshActiveEnergyBurned: () => void;
  fetchLatestWeight: () => void;
  fetchLatestBodyFatPercentage: () => void;
  estimateBMR: () => Promise<number>;
  saveFoodData: (options: Object) => void;
  getCurrentWeight: () => Promise<number | null>;
  initializeHealthKit: (permissions: HealthKitPermissions) => Promise<void>;
};

const defaultContext: HealthDataContextType = {
  weeklyActivity: [],
  dailyActiveEnergyBurned: 0,
  lastWeightDate: null,
  lastWeight: 0,
  lastBodyFat: 0,
  refreshActiveEnergyBurned: () => {},
  fetchLatestWeight: () => {},
  fetchLatestBodyFatPercentage: () => {},
  estimateBMR: async () => {
    return 0;
  },
  saveFoodData: () => {},
  getCurrentWeight: async () => {
    if (Platform.OS !== "ios") return null;

    return new Promise((resolve) => {
      AppleHealthKit.getLatestWeight(
        { unit: AppleHealthKit.Constants.Units.gram },
        (err: string, results: { value: number }) => {
          if (err) {
            console.error("Error getting weight:", err);
            resolve(null);
            return;
          }
          resolve(results.value / 1000);
        }
      );
    });
  },
  initializeHealthKit: async () => {},
};

export const HealthDataContext =
  createContext<HealthDataContextType>(defaultContext);

type HealthDataProviderProps = {
  children: ReactNode;
};

export const HealthDataProvider: React.FC<HealthDataProviderProps> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(true);
  const [dailyActiveEnergyBurned, setDailyActiveEnergyBurned] =
    useState<number>(0);
  const [weeklyActivity, setWeeklyActivity] = useState<
    {
      value: number;
      startDate: string;
      endDate: string;
    }[]
  >([]);
  const [lastWeightDate, setLastWeightDate] = useState<Date | null>(null);
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [lastBodyFat, setLastBodyFat] = useState<number | null>(null);

  // Refresh active energy when initialized
  useEffect(() => {
    if (isInitialized) {
      console.log("[DEBUG] Initial refresh of active energy");
      refreshActiveEnergyBurned();
    }
  }, [isInitialized]);

  // Refresh active energy when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        console.log("[DEBUG] App active, refreshing active energy");
        refreshActiveEnergyBurned();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeHealthKit = async (permissions: HealthKitPermissions) => {
    return new Promise<void>((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error("[ERROR] Cannot grant permissions:", error);
          reject(error);
        } else {
          setIsInitialized(true);
          resolve();
        }
      });
    });
  };

  if (!isInitialized) {
    return null; // Or a loading indicator
  }

  const fetchLatestWeight = () => {
    AppleHealthKit.getLatestWeight(
      { unit: AppleHealthKit.Constants.Units.gram },
      (err: string, result: { value: number; endDate: string }) => {
        if (err) {
          console.error("Error getting latest weight:", err);
          setLastWeightDate(null);
          setLastWeight(null);
        } else {
          setLastWeightDate(new Date(result.endDate));
          setLastWeight(result.value);
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

  const refreshActiveEnergyBurned = () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const options = {
      startDate: startOfToday.toISOString(),
      endDate: new Date().toISOString(),
      ascending: true,
      includeManuallyAdded: true,
    };

    console.log("[DEBUG] Fetching active energy with options:", options);

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (
        error: string,
        results: { value: number; startDate: string; endDate: string }[]
      ) => {
        if (error) {
          console.error(
            "[DEBUG] Error fetching active energy burned data:",
            error
          );
        } else {
          console.log("[DEBUG] Raw active energy results:", results);
          const dailyEnergyBurned = results.reduce(
            (sum, item) => sum + item.value,
            0
          );
          console.log(
            "[DEBUG] Calculated daily energy burned:",
            dailyEnergyBurned
          );
          setDailyActiveEnergyBurned(dailyEnergyBurned);
        }
      }
    );
  };

  type HealthData = {
    weight: number;
    height: number;
    biologicalSex: "male" | "female";
    age: number;
  };

  const fetchHealthData = async (): Promise<HealthData | null> => {
    try {
      console.log("Fetching all health data...");
      const [weight, height, biologicalSex, dateOfBirth] = await Promise.all([
        new Promise<number>((resolve, reject) => {
          AppleHealthKit.getLatestWeight(
            { unit: AppleHealthKit.Constants.Units.gram },
            (err, result) => {
              if (err) reject(err);
              else resolve(result.value / 1000); // Convert to kg
            }
          );
        }),
        new Promise<number>((resolve, reject) => {
          AppleHealthKit.getLatestHeight(null, (err, results) => {
            if (err) reject(err);
            else resolve(results.value * 2.54); // Convert to cm
          });
        }),
        new Promise<"male" | "female">((resolve, reject) => {
          AppleHealthKit.getBiologicalSex(null, (err, results: HealthValue) => {
            if (err) reject(err);
            else resolve(results.value === 0 ? "female" : "male");
          });
        }),
        new Promise<number>((resolve, reject) => {
          AppleHealthKit.getDateOfBirth(null, (err, results) => {
            if (err) reject(err);
            else resolve(results.age);
          });
        }),
      ]);

      console.log("Health data fetched:", {
        weight,
        height,
        biologicalSex,
        age: dateOfBirth,
      });
      return { weight, height, biologicalSex, age: dateOfBirth };
    } catch (error) {
      console.error("Error fetching health data:", error);
      return null;
    }
  };

  const estimateBMR = async () => {
    try {
      const healthData = await fetchHealthData();
      if (!healthData) {
        console.error("Could not fetch required health data");
        return null;
      }

      const { weight, height, biologicalSex, age } = healthData;
      const s = biologicalSex === "male" ? 5 : -161;
      const BMR = 10 * weight + 6.25 * height - 5 * age + s;

      console.log("BMR Calculation details:", {
        weight,
        height,
        biologicalSex,
        age,
        BMR,
        formula: `10 * ${weight} + 6.25 * ${height} - 5 * ${age} + ${s}`,
      });

      return BMR;
    } catch (error) {
      console.error("Error calculating BMR:", error);
      return null;
    }
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
        weeklyActivity,
        dailyActiveEnergyBurned,
        lastWeightDate,
        lastWeight,
        lastBodyFat,
        refreshActiveEnergyBurned,
        fetchLatestWeight,
        fetchLatestBodyFatPercentage,
        estimateBMR,
        saveFoodData,
        getCurrentWeight: async () => {
          if (Platform.OS !== "ios") return null;

          return new Promise((resolve) => {
            AppleHealthKit.getLatestWeight(
              { unit: AppleHealthKit.Constants.Units.gram },
              (err: string, results: { value: number }) => {
                if (err) {
                  console.error("Error getting weight:", err);
                  resolve(null);
                  return;
                }
                resolve(results.value / 1000);
              }
            );
          });
        },
        initializeHealthKit,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => useContext(HealthDataContext);
