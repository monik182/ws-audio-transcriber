chrome.action.onClicked.addListener(() => {
  chrome.action.openPopup();
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  chrome.storage.sync.get("token", async result => {
    if (!result.token) return;

    let oggBlob = await fetch(request.oggBlobURL);
    oggBlob = await oggBlob.blob();

    const formData = new FormData();
    formData.append("file", oggBlob, "audio.ogg");
    formData.append("model", "whisper-1");

    let WhisperResponse;
    try {
      WhisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${result.token}`
        },
        body: formData
      })
      WhisperResponse = await WhisperResponse.json();
    }
    catch (e) {
      console.log(e);
      return;
    }

    storage_local_set(request.id, {
      text: WhisperResponse.text || WhisperResponse.error?.message || "",
      error: WhisperResponse.text == null
    });

    chrome.tabs.sendMessage(sender.tab.id, {
      id: request.id,
      oggBlobURL: request.oggBlobURL
    });
  });
});

function storage_local_set(key, value) {
  const obj = {};

  obj[key] = {
    value: value,
    timestamp: Date.now()
  };

  const size = JSON.stringify(obj).length;
  const quota = chrome.storage.local.QUOTA_BYTES;

  if (size >= quota) {
    chrome.storage.local.get(null, result => {
      const memory = [];

      Object.keys(result).forEach(key => {
        if (key == "token") return;
        memory.push({
          key: key,
          timestamp: result[key].timestamp
        });
      });

      memory.sort((a, b) => {
        return a.timestamp - b.timestamp;
      });

      for (let i = 0; i < memory.length / 2; i++) {
        chrome.storage.local.remove(memory[i].key);
      }
    });
  }

  chrome.storage.local.set(obj);
}