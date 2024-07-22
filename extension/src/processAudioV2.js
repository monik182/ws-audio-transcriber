import { waitUntil } from './util'

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
  // console.log('messages>>>>>>>>>>>>', messages)

  let filteredMessages = messages
    .filter(message => !!message.msgs._models[message.msgs._models.length - 1])
    .map(message => message.msgs._models[message.msgs._models.length - 1])
    .filter(message => message.__x_type === "ptt" || message.__x_type === "audio")
  // console.log('filteredMessages>>>>>>>>>>>>', filteredMessages)
  return filteredMessages
}

async function listenOnAdd(onMessage) {
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

(() => {
  const interval = setInterval(async () => {
    if (!document.querySelector("#side")) return
    clearInterval(interval)

    const MediaBlobCache = (await loadModule("WAWebMediaInMemoryBlobCache", 300000))?.InMemoryMediaBlobCache

    if (!MediaBlobCache) return

    const onMessage = onMessageFactory(MediaBlobCache)

    await listenOnAdd(onMessage)

    const messages = await getAudioMessages()
    messages.forEach(message => onMessage(message))

  }, 100)
})()

// TODO: after testing IFEE do an init function and invoke it on extension installed