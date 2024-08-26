// import transcribeGoogle from './transcribeGoogle'
import transcribeAudio from './transcribe'
const script = document.createElement("script");
const src = chrome.runtime.getURL("loadAudios.bundle.js");
script.src = src;
document.body.appendChild(script);
let count = 0;

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

async function uploadAudioBlob(blobUrl) {
  const response = await fetch(blobUrl);
  const blob = await response.blob(); // Convert blob URL to a blob object

  // Create a new FormData object
  let formData = new FormData();
  formData.append("file", blob, "audio-file.ogg");

  // Send the blob to your Firebase Function
  fetch("http://127.0.0.1:5001/ws-audio-transcript/us-central1/transcribeAudioFromBlob", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => console.log("Transcription: ", data))
    .catch(error => console.error("Error uploading audio:", error));
}
