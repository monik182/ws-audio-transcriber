const script = document.createElement("script");
const src = chrome.runtime.getURL("loadAudios.bundle.js");
script.src = src;
document.body.appendChild(script);
let count = 0;

window.addEventListener("audioOGG", async (data) => {
  const id = data.detail.id;
  count += 1
  if (count === 1) {
    console.log('count is one')
    console.log(id, '^^^^^audioOGG event listener....', data.detail.oggBlobURL)
    chrome.runtime.sendMessage({
      id: id,
      action: "fromContent",
      oggBlobURL: data.detail.oggBlobURL
    });
  }
});
