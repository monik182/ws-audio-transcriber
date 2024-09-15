import transcribeAudio from './transcribe';
// const transcribeAudio = require('./transcribe');

console.log("Service Worker Loaded");

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker fetching.');
});


chrome.runtime.onInstalled.addListener(details => {
  console.log('installed details>>>>', details)
});

chrome.tabs.onActivated.addListener(init);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('a message in the background....', request)
  // if (request.action === 'fromContent') {
  //   // let oggBlob = await fetch(request.oggBlobURL);
  //   // oggBlob = await oggBlob.blob();
  //   // console.log('request inside oggBlob', oggBlob)
  //   console.log('request inside oggBlob URL', request.oggBlobURL)
  //   const transcription = await getTranscription(request.oggBlobURL)
  //   console.log('TRANSCRIPTION>>>', transcription)
  // }
  chrome.storage.sync.get("token", async result => {
    console.log('********TOKEN>>>', result)
  //   if (!result.token) return;

  //   console.log('request inside sync', request)
  //   let oggBlob = await fetch(request.oggBlobURL);
  //   oggBlob = await oggBlob.blob();

    // const formData = new FormData();
    // formData.append("file", oggBlob, "audio.ogg");
    // formData.append("model", "whisper-1");

    // let WhisperResponse;
    // try {
    //   WhisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${result.token}`
    //     },
    //     body: formData
    //   })
    //   WhisperResponse = await WhisperResponse.json();
    // }
    // catch (e) {
    //   console.log(e);
    //   return;
    // }

    // storage_local_set(request.id, {
    //   text: WhisperResponse.text || WhisperResponse.error?.message || "",
    //   error: WhisperResponse.text == null
    // });

    // chrome.tabs.sendMessage(sender.tab.id, {
    //   id: request.id,
    //   oggBlobURL: request.oggBlobURL
    // });
  });
});


async function getTranscription(blobUrl) {
  const response = await fetch(blobUrl);
  console.log('*****GEtting upload audio url', blobUrl);
  const blob = await response.blob(); // Convert blob URL to a blob object
  console.log('*****GEtting upload audio BLOB', blob);

  const audioBlob = new Blob([blob], { type: 'audio/ogg' });

  const transcription = await transcribeAudio(audioBlob);
  return transcription?.transcription?.text;
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
