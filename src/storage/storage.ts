import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStorageValue(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function getMultipleStorageValues(
  keys: string[]
): Promise<Record<string, string | null>> {
  const values = await AsyncStorage.multiGet(keys);
  return values.reduce<Record<string, string | null>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
}

export async function setStorageValue(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeStorageValue(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
