import { waitUntil } from './util';

export default function init() {
  console.log('INIT ##********************** INSIDE PROCEESS AUDIO ************************')
  let MediaBlobCache;

  const loadModule = (name, id) => {
    window.ErrorGuard?.skipGuardGlobal(true);
    return new Promise(r => {
      try {
        console.log('loadModule onTRY webpackChunkwhatsapp_web_client???>>>>', window.webpackChunkwhatsapp_web_client)
        window.webpackChunkwhatsapp_web_client?.push([[Math.random()], {}, e => {
          const module = e(id);
          r(module.default ? module.default : module);
        }]);
        r(window.require?.(name));
      }
      catch (e) {
        r(null);
      }
    });
  };

  const on_message = async (msg) => {
    if (msg.__x_type != "ptt" && msg.__x_type != "audio") return;

    try {
      await msg.downloadMedia({
        downloadEvenIfExpensive: true,
        isUserInitiated: true,
        rmrReason: 1
      });

      await waitUntil(() => {
        return msg.mediaData.mediaStage == "RESOLVED";
      }, 10, 1000 * 60 * 10);

      window.dispatchEvent(new CustomEvent("audioOGG", {
        detail: {
          id: msg.__x_id._serialized,
          oggBlobURL: MediaBlobCache.getOrCreateURL(msg.__x_filehash)
        }
      }));
    }
    catch (e) {
      console.log(e);
    }
  }

  const interval = setInterval(async () => {
    if (!document.querySelector("#side")) return;
    clearInterval(interval);

    const WAWebMediaInMemoryBlobCache = await loadModule("WAWebMediaInMemoryBlobCache", 196127)
    console.log('WAWebMediaInMemoryBlobCache>>>>>', WAWebMediaInMemoryBlobCache)
    MediaBlobCache = WAWebMediaInMemoryBlobCache?.InMemoryMediaBlobCache;
    // MediaBlobCache = (await loadModule("WAWebMediaInMemoryBlobCache", 196127)).InMemoryMediaBlobCache;

    if (!MediaBlobCache) return

    (await loadModule("WAWebCollections", 729804)).Msg.on("add", on_message);

    (await loadModule("WAWebChatCollection", 351053)).ChatCollection.getModelsArray().forEach(e => {
      const lastMessage = e.msgs._models[e.msgs._models.length - 1];
      if (!lastMessage) return;
      on_message(lastMessage);
    });

  }, 100);
}

// let messages = (await loadModule("WAWebChatCollection", 351053)).ChatCollection.getModelsArray()
// // console.log(messages)
// let mappedMessages = messages.map(m => {
//   console.log('MESSAGE?????', m)
//   return m
// })
// let filteredMessages = messages
//   .filter(message => !!message.msgs._models[message.msgs._models.length - 1])
//   .map(message => message.msgs._models[message.msgs._models.length - 1])
//   .filter(message => message.__x_type === "ptt" || message.__x_type === "audio")
// console.log(filteredMessages)
//   // msg.__x_type != "ptt" && msg.__x_type != "audio"
// (await loadModule("WAWebChatCollection", 351053)).ChatCollection.getModelsArray().forEach(e => {
//   console.log('e>>>', e)
// });