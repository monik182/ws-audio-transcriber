const script = document.createElement("script");
const src = chrome.runtime.getURL("processAudios.bundle.js");
script.src = src;
document.body.appendChild(script);

window.addEventListener("audioOGG", async (data) => {
  console.log('****audioOGG event listener....', data)
  const id = data.detail.id;

  let oggBlob = await fetch(data.detail.oggBlobURL);
  oggBlob = await oggBlob.blob();

});
