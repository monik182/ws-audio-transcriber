export const waitUntil = async (conditionFunc, tickTime, maxTime) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      maxTime -= tickTime;

      if (maxTime <= 0) {
        clearInterval(interval);
        reject();
      }

      if (conditionFunc()) {
        clearInterval(interval);
        resolve();
      }

    }, tickTime);
  });
}

const loadModule = (name, id) => {
  window.ErrorGuard?.skipGuardGlobal(true)
  return new Promise(r => {
    try {
      window.webpackChunkwhatsapp_web_client?.push([[Math.random()], {}, e => {
        const module = e(id)
        r(module.default ? module.default : module)
      }])
      r(window.require?.(name))
    }
    catch (e) {
      r(null)
    }
  })
}

async function getAudioMessages() {
  const chat = await loadModule("WAWebChatCollection", 100000)
  const messages = chat.ChatCollection.getModelsArray()

  let filteredMessages = messages
    .filter(message => !!message.msgs._models[message.msgs._models.length - 1])
    .map(message => message.msgs._models[message.msgs._models.length - 1])
    .filter(message => message.__x_type === "ptt" || message.__x_type === "audio")
  return filteredMessages
}

async function listenOnAdd(onMessage) {
  // console.log('!!!!_________------listenninh on add a new message....');
  (await loadModule("WAWebCollections", 200000)).Msg.on("add", onMessage)
}

function onMessageFactory(MediaBlobCache) {
  return async function (message) {
    if (message.__x_type != "ptt" && message.__x_type != "audio") return

    try {
      await message.downloadMedia({
        downloadEvenIfExpensive: true,
        isUserInitiated: true,
        rmrReason: 1
      })

      await waitUntil(() => {
        return message.mediaData.mediaStage == "RESOLVED"
      }, 10, 1000 * 60 * 10)

      window.dispatchEvent(new CustomEvent("audioOGG", {
        detail: {
          id: message.__x_id._serialized,
          oggBlobURL: MediaBlobCache.getOrCreateURL(message.__x_filehash)
        }
      }))
    }
    catch (e) {
      console.log(e)
    }
  }
}

// (() => {
//   console.log('*****************************STARTING THE LOAD AUDIOS SCRIPT******************************')
//   const interval = setInterval(async () => {
//     console.log('^^^^^^^^ checking the interval...')
//     if (!document.querySelector("#side")) return
//     clearInterval(interval)

//     const MediaBlobCache = (await loadModule("WAWebMediaInMemoryBlobCache", 300000))?.InMemoryMediaBlobCache

//     if (!MediaBlobCache) return

//     const onMessage = onMessageFactory(MediaBlobCache)

//     await listenOnAdd(onMessage)

//     const messages = await getAudioMessages()
//     messages.forEach(message => onMessage(message))

//   }, 100)
// })()f

(() => {
  console.log('*****************************STARTING THE LOAD AUDIOS SCRIPT 3******************************')
  const interval = setInterval(async () => {
    // console.log('#^^^^^^^^ checking the interval...#')
    const sideElement = document.querySelector("#side");

    if (!sideElement) return;  // Keep checking if #side isn't found

    clearInterval(interval);  // Clear the interval only when #side is found
    console.log("Element #side found, clearing interval");

    const MediaBlobCache = (await loadModule("WAWebMediaInMemoryBlobCache", 300000))?.InMemoryMediaBlobCache;

    if (!MediaBlobCache) return;

    const onMessage = onMessageFactory(MediaBlobCache);

    await listenOnAdd(onMessage);

    const messages = await getAudioMessages();
    messages.forEach(message => onMessage(message));

  }, 100);  // Interval runs every 100ms
})();

