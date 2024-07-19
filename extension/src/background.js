// chrome.runtime.onInstalled.addListener(() => {
//   console.log("Hello World Extension installed.");
// });

// chrome.action.onClicked.addListener((tab) => {
//   console.log('CURRENT TAB>>>>', tab)
//   if (tab.url.includes("web.whatsapp.com")) {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       files: ["content.bundle.js"]
//     }).then(() => {
//       console.log("Content script injected.");
//     }).catch((error) => {
//       console.error("Failed to inject content script:", error);
//     });
//   } else {
//     console.log("This extension only works on web.example.com");
//   }
// });

chrome.tabs.onActivated.addListener(init);

chrome.runtime.onMessage.addListener(
  function (request) {
    console.log('GEN listener BG', request)
    // chrome.storage.local.set({ audios: request.data });
  }
);

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
