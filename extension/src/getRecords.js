export default function getAllRecordsFromIndexedDB(dbName, objectStoreName) {
  return new Promise((resolve, reject) => {
    console.log('Opening database:', dbName);
    // Open the database
    let request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
      console.log('Database opened successfully');
      let db = event.target.result;
      let transaction = db.transaction([objectStoreName], 'readonly');
      let objectStore = transaction.objectStore(objectStoreName);

      // Get all records
      let getAllRequest = objectStore.getAll();

      getAllRequest.onsuccess = function (event) {
        let records = event.target.result;
        console.log('Records retrieved:', records);
        resolve(records);
      };

      getAllRequest.onerror = function (event) {
        console.error('Error reading records:', event.target.errorCode);
        reject('Error reading records: ' + event.target.errorCode);
      };
    };

    request.onerror = function (event) {
      console.error('Error opening database:', event.target.errorCode);
      reject('Error opening database: ' + event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
      console.log('Upgrading database...');
      let db = event.target.result;
      if (!db.objectStoreNames.contains(objectStoreName)) {
        db.createObjectStore(objectStoreName, { keyPath: ['internalId', 'isMediaMsg'] });
        console.log('Object store created:', objectStoreName);
      }
    };
  });
}
