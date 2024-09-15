
chrome.runtime.onInstalled.addListener(details => {
  console.log('installed details>>>>', details)
});

chrome.tabs.onActivated.addListener(init);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('a message in the background....', request)
  chrome.storage.sync.get("token", async result => {
    console.log('********TOKEN>>>', result)
    if (!result.token) return;
    const { token } = result;

    if (request.action === 'fromContent') {
      // let oggBlob = await fetch(request.oggBlobURL);
      // oggBlob = await oggBlob.blob();
      // console.log('request inside oggBlob', oggBlob)
      console.log('request inside oggBlob URL', request.oggBlobURL)
      const transcription = await getTranscription(token, request.oggBlobURL)
      console.log('***TRANSCRIPTION>>>', transcription)
      saveTranscription(request.id, {
        text: transcription.text || transcription.error?.message || "",
        error: transcription.text == null
      });
      chrome.tabs.sendMessage(sender.tab.id, {
        id: request.id,
        oggBlobURL: request.oggBlobURL
      });
    }

  });
});

async function getTranscription(token, blobUrl) {
  const oggBlob = await fetch(blobUrl).then(result => result.blob());

  const formData = new FormData();
  formData.append("file", oggBlob, "audio.ogg");
  formData.append("model", "whisper-1");

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
    response = await response.json();
    return response;
  }
  catch (e) {
    console.log(e);
    return;
  }
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function execute(tab) {
  // console.log('CURRENT TAB>>>>', tab)
  if (tab.url.includes("web.whatsapp.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.bundle.js"]
      // files: ["content.bundle.js"]
    }).then(() => {
      // console.log("Content script injected.");
    }).catch((error) => {
      console.error("Failed to inject content script:", error);
    });
  } else {
    // console.log("This extension only works on web.example.com");
  }
}

async function init() {
  const tab = await getCurrentTab()

  if (tab) {
    execute(tab)
  }
}



function saveTranscription(key, value) {
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