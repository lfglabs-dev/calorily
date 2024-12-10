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
          AppleHealthKit.Constants.Permissions.Height,
          AppleHealthKit.Constants.Permissions.BiologicalSex,
          AppleHealthKit.Constants.Permissions.DateOfBirth,
        ],
        write: [
          AppleHealthKit.Constants.Permissions.EnergyConsumed,
          AppleHealthKit.Constants.Permissions.Protein,
          AppleHealthKit.Constants.Permissions.Carbohydrates,
          AppleHealthKit.Constants.Permissions.FatTotal,
        ],
      },
    } as HealthKitPermissions;

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error("[ERROR] Cannot grant permissions:", error);
      } else {
        refreshActiveEnergyBurned();
        fetchLatestWeight();
        fetchLatestBodyFatPercentage();
      }
    });
  };

  const fetchLatestWeight = () => {
    AppleHealthKit.getLatestWeight(
      { unit: "gram" } as any,
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

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (
        error: string,
        results: { value: number; startDate: string; endDate: string }[]
      ) => {
        if (error) {
          console.error("Error fetching active energy burned data:", error);
        } else {
          const dailyEnergyBurned = results.reduce(
            (sum, item) => sum + item.value,
            0
          );
          setDailyActiveEnergyBurned(dailyEnergyBurned);
        }
      }
    );
  };

  const estimateBMR = async () => {
    // Check if lastWeight and lastBodyFat are available
    if (lastWeight === null) {
      console.error("Weight data is not available");
      return null;
    }

    let BMR = 0;
    if (lastBodyFat !== null) {
      // Katch-McArdle formula
      const leanBodyMass = lastWeight * (1 - lastBodyFat / 100);
      BMR = 370 + (21.6 * leanBodyMass) / 1000;
    } else {
      let height: number;
      // Fetch height
      try {
        const heightResult: any = await new Promise((resolve, reject) => {
          AppleHealthKit.getLatestHeight(null, (err, results) => {
            if (err) {
              reject("error getting latest height: " + err);
            } else {
              resolve(results);
            }
          });
        });
        height = heightResult.value * 2.54;
      } catch (error) {
        console.error(error);
        return null;
      }

      let biologicalSex: "female" | "male";

      // Fetch biological sex
      try {
        const biologicalSexResult: any = await new Promise(
          (resolve, reject) => {
            AppleHealthKit.getBiologicalSex(null, (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            });
          }
        );
        biologicalSex = biologicalSexResult.value;
      } catch (error) {
        console.error(error);
        return null;
      }

      // Fetch age
      let age: number;
      try {
        const ageResult: any = await new Promise((resolve, reject) => {
          AppleHealthKit.getDateOfBirth(null, (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
        age = ageResult.age;
      } catch (error) {
        console.error(error);
        return null;
      }

      // Mifflin-St Jeor formula
      const weightInKg = lastWeight / 1000;
      const s = biologicalSex === "male" ? 5 : -161;
      BMR = 10 * weightInKg + 6.25 * height - 5 * age + s;
    }

    return BMR;
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
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => useContext(HealthDataContext);
