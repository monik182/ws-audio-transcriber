const script = document.createElement("script");
const src = chrome.runtime.getURL("loadAudios.bundle.js");
script.src = src;
document.body.appendChild(script);
let count = 0;

// console.log('STARTED THIS content SCRIPT')
// const input = document.querySelector('#ext-openai-token')
// const button = document.querySelector('#ext-save-token')
// const a = document.querySelector('#ext-new-button')

// console.log('THESE ARE THE CURRENT ELEMENTS***', {
//   input,
//   button,
//   a,
// })

// document.addEventListener("DOMContentLoaded", (event) => {
//   console.log("DOM fully loaded and parsed");
// });

window.addEventListener("audioOGG", async (data) => {
  // console.log('****audioOGG event listener....', data)
  const id = data.detail.id;
  // console.log(id, '^^^^^audioOGG event listener....', data.detail.oggBlobURL)
  count += 1
  if (count === 1) {
    console.log('count is one')
    console.log(id, '^^^^^audioOGG event listener....', data.detail.oggBlobURL)
    // const transcription = await transcribeGoogle(data.detail.oggBlobURL)
    // const transcription = await transcribeAudio(data.detail.oggBlobURL)
    chrome.runtime.sendMessage({
      id: id,
      action: "fromContent",
      oggBlobURL: data.detail.oggBlobURL
    });
    // const transcription = await uploadAudioBlob(data.detail.oggBlobURL)
    // console.log('TRANSCRIPTION>>>', transcription)
  }
  
  // let oggBlob = await fetch(data.detail.oggBlobURL);
  // oggBlob = await oggBlob.blob();
  // console.log('****audioOGG event listener....', oggBlob)

});
