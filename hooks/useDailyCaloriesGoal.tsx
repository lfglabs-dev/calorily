import { useEffect, useState } from "react";
import { useApplicationSettings } from "../shared/ApplicationSettingsContext";
import { useHealthData } from "../shared/HealthDataContext";

const useDailyCaloriesGoal = () => {
  const { settings } = useApplicationSettings();
  const { lastWeight, dailyActiveEnergyBurned } = useHealthData();
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(0);

  useEffect(() => {
    if (settings) {
      let totalEnergy =
        settings.metabolicData.basalMetabolicRate + dailyActiveEnergyBurned;
      if (lastWeight / 1000 > settings.metabolicData.targetMaximumWeight) {
        totalEnergy -= settings.metabolicData.targetCaloricDeficit;
      } else if (
        lastWeight / 1000 <
        settings.metabolicData.targetMinimumWeight
      ) {
        totalEnergy += settings.metabolicData.targetCaloricSurplus;
      }
      setDailyCaloriesGoal(totalEnergy);
    }
  }, [settings, dailyActiveEnergyBurned]);

  return dailyCaloriesGoal;
};

export default useDailyCaloriesGoal;
