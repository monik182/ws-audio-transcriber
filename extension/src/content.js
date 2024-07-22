// import processAudio from './processAudios'
// import init from './processAudios2'

const script = document.createElement("script");
console.log('Getting url!!!!')
// init()
// const src = chrome.runtime.getURL("processAudios.bundle.js");
const src = chrome.runtime.getURL("processAudiosV2.bundle.js");
// const src = chrome.runtime.getURL("src/processAudios.js");
console.log('SRC>>>>>', src)
script.src = src;
document.body.appendChild(script);

export default function readIndexedDB() {
  const dbName = "model-storage"; // Replace with your actual IndexedDB name
  const objectStoreName = "message";
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction([objectStoreName], 'readonly');
      let objectStore = transaction.objectStore(objectStoreName);

      let getAllRequest = objectStore.getAll();

      getAllRequest.onsuccess = function (event) {
        let records = event.target.result;
        resolve({ records, objectStoreName });
      };

      getAllRequest.onerror = function (event) {
        reject('Error reading records: ' + event.target.errorCode);
      };
    };

    request.onerror = function (event) {
      reject('Error opening database: ' + event.target.errorCode);
    };

  });
}

function sendMessageToPopup(storeName, data) {
  console.log('sending message to popup>>>>')
  chrome.runtime.sendMessage({
    action: "sendAudios",
    data,
  });
  // chrome.tabs.sendMessage({
  //   action: "sendData2",
  //   storeName: storeName,
  //   data: data
  // });
}

// chrome.runtime.onMessage.addListener((message) => {
//   console.log('new message on popuo', 'installedExt', message)
// })

window.addEventListener("audioOGG", async (data) => {
  console.log('****audioOGG event listener....', data)
  const id = data.detail.id;

  let oggBlob = await fetch(data.detail.oggBlobURL);
  oggBlob = await oggBlob.blob();
  // TODO: this is the one that works
  // executeInverseMethod2(oggBlob)

  // chrome.storage.local.get(id, (result) => {
  //   if (result[id]) return;

  //   chrome.runtime.sendMessage({
  //     id: id,
  //     oggBlobURL: data.detail.oggBlobURL
  //   });
  // });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const id = request.id;
  console.log('GENERIC listener', request)

  // window.URL.revokeObjectURL(request.wavBlobURL);

  // let el = document.querySelector(`[data-id="${id}"]`);
  // if (!el) return;

  // el = el.querySelector("._ak49._ak48") || el.querySelector("._ak4a._ak48");
  // if (!el) return;

  // putText(id, el);
});

readIndexedDB()
  .then(({ records, objectStoreName }) => {
    const audioRecords = records.filter((record) => record.type === 'audio')
    const [,,,,,,,audio] = audioRecords
    console.log('^^^^^OG AUDIO', audio)
    // console.log('^^^^^OG AUDIO buffer', audio.waveform.buffer)
    console.log('^^^^^OG AUDIO buffer', audio.msgRowOpaqueData.iv)
    // executeInverseMethod(audio)

    // executeInverseMethod(audio)
    // fetch('https://media-mad2-1.cdn.whatsapp.net/v/t62.7117-24/23117941_2784155691745320_2096355199029027188_n.enc?ccb=11-4&oh=01_Q5AaIPuQe5ieAgcj7vLo4nGqP7cJs2bpd7eY6FvOmVvFLfqc&oe=66BE58EE&_nc_sid=5e03e0&hash=yhn1Ht0jClgb8H6ppSLrK0nDLBUmFcGbjzLNjnDYMug%3D&_nc_cat=108&_nc_map=whatsapp-nofna&mode=manual&mms-type=ptt&__wa-mms=')
    // .then(response => {
    //   console.log('RESPNSE', response)
    //   return response.blob()
    //   // return response.arrayBuffer()
    // })
    // .then(lastRes => {
    //   console.log('lastRES', lastRes)
    //   executeInverseMethod(lastRes)
    // })

    // const uint8Array = audio.waveform;
    const uint8Array = new Uint8Array(audio.msgRowOpaqueData.iv);
    // const uint8Array = new Uint8Array(audio.waveform);
    // const mimeType = 'audio/ogg; codecs=opus'; // or 'audio/wav'
    const mimeType = audio.mimetype;
    const filename = 'output_audio';

    // const converter = new AudioConverter();
    // converter.convertAndDownload(uint8Array, mimeType, filename)
    // .then(response => {
    //   console.log('RESONSE FROM COVERT', response)
    // })
    // .catch(error => {
    //   console.log('ERROR FROM CONVERT', error)
    // })
    // console.log('###>>>>>>***Retrieved AUDIO records:', audioRecords.length, audioRecords);
    // setTimeout(() => {
    //   // console.log('storing and sending message....')
    //   chrome.storage.local.set({ audios: JSON.stringify(audioRecords) });
    //   sendMessageToPopup(objectStoreName, audioRecords);
    // }, 2000);
  })
  .catch(error => {
    console.error('Error:', error);
  });

async function executeInverseMethod2(audio) {
  // const audioData = await inverseMethod(audio.waveform, parseInt(audio.duration), 16);

  // Download the file
  const blob = new Blob([audio], { type: 'audio/ogg' });
  // const blob = new Blob([audioData], { type: 'audio/ogg' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = '_*reconstructed_audio.ogg';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
