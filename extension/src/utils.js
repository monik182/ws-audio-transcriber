export const TOKEN_KEY = 'token';

export const saveToStorage = async (key, value) => {
  await chrome.storage.sync.set({ [key]: value });
};

export const removeFromStorage = async (key) => {
  await chrome.storage.sync.remove(key);
};

export const getFromStorage = async (key) => {
  const value = await chrome?.storage?.sync?.get?.(key);
  return value[key];
};

export async function getModels(token) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(response => response.json())
    return response;
  } catch (error) {
    throw error;
  }
}

export function obfuscateToken(token) {
  const hyphenIndex = token.indexOf('-');

  if (hyphenIndex === -1) {
    return token;
  }

  const firstPart = token.slice(0, hyphenIndex + 1);
  const lastPart = token.slice(-4);
  return `${firstPart}****${lastPart}`;
}

export async function wait(ms = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
