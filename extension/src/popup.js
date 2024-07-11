// import AudioConverter from './audioConverter.js';
// import getAllRecordsFromIndexedDB from './getRecords.js';
// let RECORDS = []

// document.getElementById("printButton").addEventListener("click", () => {
//   console.log("Hello");
//   alert("Hello");
// });

// document.addEventListener("DOMContentLoaded", () => {
//   console.log('DOM IS READY!!!!')
//   getAllRecordsFromIndexedDB('model-storage', 'message')
    // .then(records => {
    //   console.log('***Retrieved records:', records);
    //   // RECORDS = records
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });
// })




// const uint8Array = new Uint8Array([/* your Uint8Array data */]);
// const mimeType = 'audio/ogg; codecs=opus'; // or 'audio/wav'
// const filename = '_outputAudio';

// const converter = new AudioConverter();
// converter.convertAndDownload(uint8Array, mimeType, filename);

chrome.runtime.onMessage.addListener((message) => {
  console.log('MESAGE???>>>>', message)
  if (message.action === "sendData") {
    const contentDiv = document.getElementById("content");
    const storeDiv = document.createElement("div");
    storeDiv.classList.add("store");

    const storeNameHeading = document.createElement("h2");
    storeNameHeading.textContent = message.storeName;
    storeDiv.appendChild(storeNameHeading);

    const dataPre = document.createElement("pre");
    dataPre.textContent = JSON.stringify(message.data, null, 2);
    storeDiv.appendChild(dataPre);

    contentDiv.appendChild(storeDiv);
  }
});

// getCurrentTab()
// .then()
