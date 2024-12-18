import React, { useState, useEffect } from 'react';
import { getFromStorage, removeFromStorage, saveToStorage, TOKEN_KEY, obfuscateToken, getModels } from './utils';

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
      await saveToStorage(TOKEN_KEY, inputValue);
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

  const deleteFromStorage = async (key) => {
    await removeFromStorage(key);
    const token = await getFromStorage(TOKEN_KEY);
    if (!token) {
      setToken('');
      // chrome.storage.sync.clear();
    }
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
      console.log('####### setting token and sending message.,...', token)
      handleSetToken(token)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "insertScript",
          });
        }
      });
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

// function insertLoadAudioScript() {
//   console.log('inserting audio script.....')
//   const oldScripts = document.querySelectorAll('script.load-audios');
//   oldScripts.forEach(s => {
//     s.remove()
//   })
//   const script = document.createElement("script");
//   const src = chrome.runtime.getURL("loadAudios.bundle.js");
//   script.src = src;
//   // script.classList.add('load-audios')
//   // document.body.appendChild(script);
//   (document.head || document.documentElement).appendChild(script);
// }