/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https"
 * import {onDocumentWritten} from "firebase-functions/v2/firestore"
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true})
//   response.send("Hello from Firebase!")
// })
const functions = require('firebase-functions')
const speech = require('@google-cloud/speech').SpeechClient
// const { Storage } = require('@google-cloud/storage')
// const storage = new Storage()
const speechClient = new speech()

exports.transcribeAudio = functions.storage.object().onFinalize(async (object: any) => {
    const bucketName = object.bucket
    const fileName = object.name
    const audioUri = `gs://${bucketName}/${fileName}`

    const audioConfig = {
        audioChannelCount: 1,
        enableAutomaticPunctuation: true,
        sampleRateHertz: 16000,
        languageCode: 'en-US', // Default to English
    }
    const request = {
        config: audioConfig,
        audio: { uri: audioUri },
    }

    try {
        const [response] = await speechClient.recognize(request)
        const transcription = response.results
            .map((result: any) => result.alternatives[0].transcript)
            .join('\n')
        console.log('Transcription: ', transcription)

        // Optionally, store the transcription in Firestore or return it to the client
        return transcription
    } catch (error) {
        logger.error(error)
        console.error('ERROR:', error)
        return null
    }
})
