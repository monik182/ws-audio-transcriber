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
  chrome.runtime.sendMessage({
    action: "sendData",
    storeName: storeName,
    data: data
  });
  // chrome.tabs.sendMessage({
  //   action: "sendData2",
  //   storeName: storeName,
  //   data: data
  // });
}


readIndexedDB()
  .then(({ records, objectStoreName }) => {
    const audioRecords = records.filter((record) => record.type === 'audio')
    console.log('>>>>>>***Retrieved AUDIO records:', audioRecords.length, audioRecords);
    sendMessageToPopup(objectStoreName, audioRecords);
  })
  .catch(error => {
    console.error('Error:', error);
  });