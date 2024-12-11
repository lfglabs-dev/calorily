import AsyncStorage from "@react-native-async-storage/async-storage";

export const LAST_SYNC_KEY = "last_sync_timestamp";

export const getLastSyncTimestamp = async (): Promise<string | null> => {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
};

export const setLastSyncTimestamp = async (
  timestamp: string
): Promise<void> => {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
};
