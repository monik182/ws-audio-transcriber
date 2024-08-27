import * as logger from "firebase-functions/logger"

const functions = require('firebase-functions')
import fetch from 'node-fetch';
const FormData = require('form-data');


exports.helloWorld = functions.https.onRequest((request: any, response: any) => {
    response.send(`Hello from Firebase!`);
});

exports.transcribeWithOpenAI = functions.https.onRequest(async (request: any, response: any) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_API_TRANSCRIPTIONS_URL = process.env.OPENAI_API_TRANSCRIPTIONS_URL;
    const model = 'whisper-1';
    const formData = new FormData();

    formData.append('file', request.body, "audio-file.ogg");
    formData.append('model', model);

    try {
        let whisperResponse = await fetch(OPENAI_API_TRANSCRIPTIONS_URL!, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: formData,
        })
        whisperResponse = await whisperResponse.json();
        console.log('whisperResponse>>>>', whisperResponse);
        response.status(200).send({ transcription: whisperResponse });
    }
    catch (error) {
        logger.error(error);
        response.status(500).send({ error: (error as Error).message });
    }
});
