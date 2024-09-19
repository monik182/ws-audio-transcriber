import { getFromStorage, wait } from './utils'

sessionStorage.clear();
// window.addEventListener('load', function () {
//   console.log('after loading the dom')
//   const script = document.createElement("script");
//   script.innerHTML = "console.log('inside the new script@#$%^&*&^%$#@#$%^&*&^%$#@')"
//   // const src = chrome.runtime.getURL("script.js");
//   // script.src = src;
//   // script.classList.add('load-audio');
//   // document.body.appendChild(script);
// });

// TODO: create an event from app that reloads this script

const oldScripts = document.querySelectorAll('script.load-audios');
oldScripts.forEach(s => {
  s.remove()
})
const script = document.createElement("script");
const src = chrome.runtime.getURL("loadAudios.bundle.js");
script.src = src;
script.classList.add('load-audios')
document.body.appendChild(script);
let count = 0;

window.addEventListener("audioOGG", async (data) => {
  const id = data.detail.id;
  const savedMessage = await getFromStorage(id)
  console.log('-----------------------------------current FROM CONTENT id>>>>', id, savedMessage)

  if (!savedMessage) {
    await wait(1000);
    chrome.runtime.sendMessage({
      id,
      action: "fromContent",
      oggBlobURL: data.detail.oggBlobURL,
    });
  } else {
    let el = document.querySelector(`[data-id="${id}"]`);
    if (!el) return;

    el = el.querySelector("._ak49._ak48") || el.querySelector("._ak4a._ak48");
    if (!el) return;

    insertTranscription(id, el);
  }


  // console.log('#####current id>>>>', id)
  // const storedIds = sessionStorage.getItem('ids');
  // console.log('stored ids>>>', storedIds)
  // const ids = storedIds ? JSON.parse(storedIds) : []
  // // console.log('final ids', ids)
  // const isParsing = ids.includes(id)
  // console.log({isParsing})
  // // if (isParsing) return;
  // // sessionStorage.setItem('ids', JSON.stringify([...ids, id]))
  // // count += 1
  // // if (count === 1) {
  //   // console.log('count is one')
  //   // console.log(id, '^^^^^audioOGG event listener....', data.detail.oggBlobURL)
  // // const idExists = await getFromStorage(id);
  // // console.log(id, 'ID EXISTS>>>>>', idExists)
  // if (!isParsing) {
  //   // console.log('then please send the message....')
  //   sessionStorage.setItem('ids', JSON.stringify([...ids, id]))

  //   chrome.runtime.sendMessage({
  //     id: id,
  //     action: "fromContent",
  //     oggBlobURL: data.detail.oggBlobURL
  //   });
  // } else {
  //   const storedIds = sessionStorage.getItem('ids');
  //   const ids = storedIds ? JSON.parse(storedIds) : []
  //   const filteredIds = ids.filter(_id => _id !== id)
  //   sessionStorage.setItem('ids', JSON.stringify(filteredIds))
  // }
  // }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const id = request.id;

  window.URL.revokeObjectURL(request.wavBlobURL);

  let el = document.querySelector(`[data-id="${id}"]`);
  if (!el) return;

  el = el.querySelector("._ak49._ak48") || el.querySelector("._ak4a._ak48");
  if (!el) return;

  const storedIds = sessionStorage.getItem('ids');
  const ids = storedIds ? JSON.parse(storedIds) : []
  const filteredIds = ids.filter(_id => _id !== id)
  sessionStorage.setItem('ids', JSON.stringify(filteredIds))

  insertTranscription(id, el);
});

async function insertTranscription(id, el) {
  // chrome.storage.local.get(id, (result) => {
  // });
  const savedMessage = await getFromStorage(id)

  console.log('^*^*^*^*^*^^^^^^^^^^^^INSERITNG THE TRANSCRIPTION?????', id, savedMessage)

  if (!savedMessage) return;
  const record = savedMessage.value;
  if (!record) return;

  const txt_el = document.createElement("div");
  txt_el.classList.add("transcription-text");
  // txt_el.classList.add("copyable-text");
  txt_el.innerHTML = record.text;

  if (record.error) {
    txt_el.style = "padding-top: 10px; margin-bottom: 20px; color: red; font-weight: bold;";
  }
  else {
    txt_el.style = "padding-top: 10px; margin-bottom: 20px;";
  }

  el.appendChild(txt_el);
}
