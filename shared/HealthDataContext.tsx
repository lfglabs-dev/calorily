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
  estimateBMR: () => Promise<number>;
  saveFoodData: (options: Object) => void;
};

const defaultContext: HealthDataContextType = {
  dailyActiveEnergyBurned: 0,
  lastWeight: 0,
  lastBodyFat: 0,
  fetchDailyActiveEnergyBurned: () => {},
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
      BMR = 370 + 21.6 * leanBodyMass;
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
        height = heightResult.value*2.54;
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
        dailyActiveEnergyBurned,
        lastWeight,
        lastBodyFat,
        fetchDailyActiveEnergyBurned,
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
