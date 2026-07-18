export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
};

export const getStorageItem = <T>(key: string): T | null => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (!serializedValue) return null;
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return null;
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage', error);
  }
};
