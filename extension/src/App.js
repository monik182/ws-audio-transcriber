import React, { useState, useEffect } from 'react';

const TOKEN_KEY = 'token';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [token, setToken] = useState();
  const [error, setError] = useState();

  const handleSave = async () => {
    setError('');
    if (!inputValue) return;
    try {
      const models = await getModels(inputValue);
      console.log({models})
      if (models.error) {
        setError(models.error.message);
        return;
      }
      await saveToStorage(inputValue);
      handleSetToken(inputValue);
      setInputValue('');
    } catch (error) {
      setError(error.message || 'There has been an error with the provided api key.');
      throw error
    }
  };

  const handleDeleteToken = async () => {
    await deleteFromStorage(TOKEN_KEY)
  }

  const saveToStorage = async (token) => {
    await chrome.storage.sync.set({ token });
  };

  const deleteFromStorage = async (key) => {
    await chrome.storage.sync.remove(key);
    const token = await getFromStorage(TOKEN_KEY);
    if (!token) {
      setToken('');
    }
  };

  const getFromStorage = async (key) => {
    const value = await chrome.storage.sync.get(key);
    return value[key];
  };

  const handleSetToken = (token) => {
    const obfuscatedToken = obfuscateToken(token);
    setToken(obfuscatedToken);
  }

  useEffect(() => {
    async function getToken() {
      const token = await getFromStorage(TOKEN_KEY);
      setToken(token);
    }
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      handleSetToken(token)
    }
  }, [token]);

  if (token) {
    return (
      <div className="is-flex is-justify-content-space-around is-align-items-center p-2">
        <p className="mb-0">{token}</p>
        <button className="button is-danger" onClick={handleDeleteToken}>
          <span className="icon">
            <i className="fas fa-trash-can"></i>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="p-2">
      <input
        type="text"
        placeholder="Enter text"
        value={inputValue}
        className="input"
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px' }}
      />
      <div className="container buttons">
        <button className="button is-primary" onClick={handleSave} style={{ marginRight: '10px' }}>
          <span>Save</span>
          <span className="icon">
            <i className="fas fa-floppy-disk"></i>
          </span>
        </button>
        <a className="button is-link is-light" href="https://platform.openai.com/api-keys" target="_blank">
          <span>New</span>
          <span className="icon">
            <i className="fas fa-key"></i>
          </span>
        </a>
      </div>
      {error && (
        <div className="message is-danger">
          <div className="message-header">
            <span className="icon">
              <i className="fas fa-triangle-exclamation"></i>
            </span>
            <span>Error</span>
            <button className="delete" aria-label="delete" onClick={() => setError('')}></button>
          </div>
          <div className="message-body">
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


async function getModels(token) {
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

function obfuscateToken(token) {
  const hyphenIndex = token.indexOf('-');

  if (hyphenIndex === -1) {
    return token;
  }

  const firstPart = token.slice(0, hyphenIndex + 1);
  const lastPart = token.slice(-4);
  return `${firstPart}****${lastPart}`;
}