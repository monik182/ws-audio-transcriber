// chrome.runtime.onInstalled.addListener(() => {
//   console.log("Hello World Extension installed.");
// });

chrome.action.onClicked.addListener((tab) => {
  console.log('CURRENT TAB>>>>', tab)
  if (tab.url.includes("web.whatsapp.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.bundle.js"]
    }).then(() => {
      console.log("Content script injected.");
    }).catch((error) => {
      console.error("Failed to inject content script:", error);
    });
  } else {
    console.log("This extension only works on web.example.com");
  }
});

chrome.tabs.onActivated.addListener(init);
// chrome.tabs.onActivated.addListener(getCurrentTab);

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function execute(tab) {
  console.log('CURRENT TAB>>>>', tab)
  if (tab.url.includes("web.whatsapp.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.bundle.js"]
      // files: ["content.bundle.js"]
    }).then(() => {
      console.log("Content script injected.");
    }).catch((error) => {
      console.error("Failed to inject content script:", error);
    });
  } else {
    console.log("This extension only works on web.example.com");
  }
}

async function init() {
  const tab = await getCurrentTab()
  console.log('THIS IS THETAB in init', tab)

  if (tab) {
    execute(tab)
  }
}
