import { useEffect, useState } from "react";
import { useApplicationSettings } from "../shared/ApplicationSettingsContext";
import { useHealthData } from "../shared/HealthDataContext";

const useDailyCaloriesGoal = () => {
  const { settings } = useApplicationSettings();
  const { dailyActiveEnergyBurned } = useHealthData();
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(0);

  useEffect(() => {
    if (settings) {
      setDailyCaloriesGoal(
        settings.metabolicData.basalMetabolicRate + dailyActiveEnergyBurned
      );
    }
  }, [settings, dailyActiveEnergyBurned]);

  return dailyCaloriesGoal;
};

export default useDailyCaloriesGoal;
