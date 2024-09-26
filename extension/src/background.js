import { getFromStorage, saveToStorage, TOKEN_KEY } from './utils';

const TRANSCRIPTION_QUEUE_KEY = 'transcriptionQueue';
const SAVED_TRANSCRIPTIONS_KEY = 'savedTranscriptions';

chrome.runtime.onInstalled.addListener(details => {
  console.log('installed details>>>>', details)
});

chrome.tabs.onActivated.addListener(init);

async function emitTranscriptionEvent(id, tabId, token, oggBlobURL) {
  const transcription = await getTranscription(token, oggBlobURL)
  // const transcription = { text: `${id} - MOCKED TRANSCRIPTION - ${oggBlobURL}` }
  console.log('#***TRANSCRIPTION>>>', transcription)
  await saveTranscription(id, {
    text: transcription.text || transcription.error?.message || "",
    error: transcription.text == null
  });
  chrome.tabs.sendMessage(tabId, {
    id,
    oggBlobURL,
  });
}

// let counter = 0;
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // console.log('a message in the background....', request)
  // console.log('******** OUTSIDE TOKEN>>>', token)
  const token = await getFromStorage(TOKEN_KEY);
  console.log('********FOUND TOKEN>>>', token)

  // chrome.storage.sync.get("token", async result => {
  if (!token) return;
  //   const { token } = result;

    if (request.action === 'fromContent') {
      // counter++;
      // console.log('***********************', {counter}, '***************************')
      // if (counter > 3) return;
      const { id } = request;
      // const transcriptionQueue = await getFromStorage(TRANSCRIPTION_QUEUE_KEY) || []
      const savedMessage = await getFromStorage(id)
      // const savedTranscriptions = await getFromStorage(SAVED_TRANSCRIPTIONS_KEY) || {}
      // console.log('CURRENT SAVED TRANSCIPRIONS', savedTranscriptions)
      // const message = savedTranscriptions[id]
      console.log(id, '>>>>>>>>>CURRENT savedMessage', savedMessage)
      if (!savedMessage) {
        console.log('CRETING TRANSCRIPTION FRO ID', id, savedMessage)
        // console.log(id, 'CURRENT transcriptionQueue', transcriptionQueue)
        await emitTranscriptionEvent(id, sender.tab.id, token, request.oggBlobURL)
        // await saveToStorage(TRANSCRIPTION_QUEUE_KEY, [...transcriptionQueue, id])
      }
  //     // let oggBlob = await fetch(request.oggBlobURL);
  //     // oggBlob = await oggBlob.blob();
  //     // console.log('request inside oggBlob', oggBlob)
  //     // >>>>await emitTranscriptionEvent(request.id, sender.tab.id, token, request.oggBlobURL)
  //     // console.log('request inside oggBlob URL', request.oggBlobURL)
  //     // const transcription = await getTranscription(token, request.oggBlobURL)
  //     // console.log('***TRANSCRIPTION>>>', transcription)
  //     // saveTranscription(request.id, {
  //     //   text: transcription.text || transcription.error?.message || "",
  //     //   error: transcription.text == null
  //     // });
  //     // chrome.tabs.sendMessage(sender.tab.id, {
  //     //   id: request.id,
  //     //   oggBlobURL: request.oggBlobURL
  //     // });
    }

  // });
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

function executeContentScript(tab) {
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
  // const transcriptionQueue = await getFromStorage(TRANSCRIPTION_QUEUE_KEY)
  // if (!transcriptionQueue) {
  //   await saveToStorage(TRANSCRIPTION_QUEUE_KEY, [])
  // }
  const token = await getFromStorage(TOKEN_KEY);

  // chrome.storage.sync.clear() // TODO: remove this
  await saveToStorage(TOKEN_KEY, token)
  // chrome.storage.sync.get(null, result => {
  //   console.log('storage local', result)
  //   Object.keys(result).forEach(key => {
  //     if (key === TOKEN_KEY) return;
  //     chrome.storage.local.remove(key);
  //   });
  // })

  const tab = await getCurrentTab()

  if (tab) {
    executeContentScript(tab)
  }
}



async function saveTranscriptionNOTUSE(key, value) {
  const savedTranscriptions = await getFromStorage(SAVED_TRANSCRIPTIONS_KEY) || {}

  const updatedTranscriptions = {...savedTranscriptions};

  updatedTranscriptions[key] = {
    value,
    timestamp: Date.now()
  };

  const size = JSON.stringify(updatedTranscriptions[key]).length;
  const quota = chrome.storage.local.QUOTA_BYTES;

  console.log('SIZE>>>', size)
  console.log('QUOTA>>>', quota)

  if (size >= quota) {
    const keys = Object.keys(updatedTranscriptions);
    const memory = [];

    keys.forEach(key => {
      memory.push({
        key,
        timestamp: updatedTranscriptions[key].timestamp
      });
    });

    memory.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    for (let i = 0; i < memory.length / 2; i++) {
      delete updatedTranscriptions[memory[i].key];
    }
  }

  await saveToStorage(SAVED_TRANSCRIPTIONS_KEY, updatedTranscriptions)
}

async function saveTranscription(key, value) {
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
  console.log('-------------------------------------!!!!!!!!! saving transcription>>>', key, obj[key])
  await saveToStorage(key, obj[key])

}
