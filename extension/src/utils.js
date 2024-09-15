export const TOKEN_KEY = 'token';

export const saveToStorage = async (token) => {
  await chrome.storage.sync.set({ token });
};

export const removeFromStorage = async (key) => {
  await chrome.storage.sync.remove(key);
};

export const getFromStorage = async (key) => {
  const value = await chrome?.storage?.sync?.get?.(key);
  return value[key];
};
