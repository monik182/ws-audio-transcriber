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
import fetch from 'node-fetch';
const multer = require('multer');
const express = require('express');
const app = express();
const cors = require('cors')//({origin: true});
const bodyParser = require('body-parser')
const ffmpeg = require('fluent-ffmpeg');
// const streams = require('memory-streams')
const { PassThrough } = require('stream');

app.use(cors({ origin: true })); 
app.use(bodyParser.json())


// const { Storage } = require('@google-cloud/storage')
// const storage = new Storage()
const speechClient = new speech()


const storage = multer.diskStorage({
    destination: function(req: any, file: any, cb: any) {
        cb(null, '/tmp');  // use tmp folder which is writable in Firebase Functions
    },
    filename: function(req: any, file: any, cb: any) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });


app.post('/', upload.single('audio'), (req: any, res: any) => {
    // console.log('****upload1>>>', req)
    console.log('****upload2>>>', req.audio)
    console.log('****upload3>>>', req.body)
    console.log('****upload4>>>', req.file)
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Process the file here
    console.log('File uploaded successfully:', req.file.filename); // Confirm upload success
    res.status(200).send('File uploaded successfully: ' + req.file.filename);
});


app.post('/transcribe', upload.single('audio'), async (req: any, res: any) => {
    // console.log('****upload1>>>', req)
    // console.log('****upload2>>>', req.audio)
    // console.log('****upload3>>>', req.body)
    console.log('****upload3>>>', typeof req.body)
    // console.log('****upload4>>>', req.file)
    if (!req.body) {
        return res.status(400).send('No file uploaded.');
    }
    // const audioBytes = req.rawBody;
      // Convert OGG to LINEAR16 using ffmpeg
    // let stream = new streams.WritableStream();
        // const audioStream = new PassThrough();
    const stream = new PassThrough();
    stream.end(req.rawBody);

    const output = new PassThrough();


    ffmpeg(stream)
        // .input(audioBytes)
        .inputFormat('ogg')
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .on('end', async function() {
            console.log('@@@@@@@@@@@@Transcoding finished');
            const transcription = await transcribeAudio(output);
            console.log('THIS IS THE TRANSCRIPTION FROM THE BODY>>>', transcription)
            res.status(200).send('File uploaded successfully: ');

        })
        .on('error', function(err: any) {
            console.error('An error occurred: ' + err.message);
            res.status(500).send('Transcoding error: ' + err.message);
        })
        // .pipe(response, { end: true })
        .pipe(output, { end: true });
        // .output(stream);


    

    // console.log('###########STREAM>>>>>', stream);

    // if (!audioBytes) {
    //     return res.status(400).send('No audio data provided');
    // }

    // const transcription = await transcribeAudio(req.body);
    // const transcription = await transcribeAudio(audioBytes.toString('base64'));
    // const transcription = await transcribeAudio(audioStream);
    // console.log('THIS IS THE TRANSCRIPTION FROM THE BODY>>>', transcription)
    // Process the file here
    // console.log('File uploaded successfully:', req.file.filename); // Confirm upload success
});

app.post('/multer', upload.none(), (req: any, res: any) => {
    upload(req, res, function(err: any) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err);
            return res.status(500).send(err.message);
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error('Upload Error:', err);
            return res.status(500).send(err.message);
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        console.log('File uploaded successfully:', req.file.filename); // Confirm upload success
        res.status(200).send('File uploaded successfully: ' + req.file.filename);
    });
});





// Export the Express app as a Firebase Function
exports.uploadAudio = functions.https.onRequest(app);

exports.transcribeAudioFromBlob = functions.https.onRequest((req: any, res: any) => {
    cors(req, res, async () => {
        if (req.method === 'POST') {
            console.log('******req>>>>>>>>>>', req.body)
            // const audioBlob = req.files.audio; // Make sure you're handling file uploads correctly
            // const audioBlob = req.audio; // Make sure you're handling file uploads correctly
            const audioBlob = req.body; // Make sure you're handling file uploads correctly
            // Process the audioBlob with Google Speech-to-Text
            const audioConfig = {
                audioChannelCount: 1,
                enableAutomaticPunctuation: true,
                sampleRateHertz: 16000,
                languageCode: 'en-US', // Default to English
            }
            const request = {
                config: audioConfig,
                audio: { content: audioBlob },
            }

            try {
                const [response] = await speechClient.recognize(request)
                const transcription = response.results
                    .map((result: any) => result.alternatives[0].transcript)
                    .join('\n')
                console.log('Transcription>>>>>^^^ ', transcription)

                // Optionally, store the transcription in Firestore or return it to the client
                return transcription
            } catch (error) {
                logger.error(error)
                // console.error('ERROR:', error)
                return null
            }
        } else {
            res.status(405).send('Method Not Allowed');
        }
    });
});

async function transcribeAudio(audioBlob: any) {

    const audioConfig = {
        // audioChannelCount: 1,
        // enableAutomaticPunctuation: true,
        sampleRateHertz: 16000,
        languageCode: 'en-US', // Default to English
        encoding: 'LINEAR16',
    }
    const request = {
        config: audioConfig,
        audio: { content: audioBlob },
    }

    try {
        const [response] = await speechClient.recognize(request)
        const transcription = response.results
            .map((result: any) => result.alternatives[0].transcript)
            .join('\n')
        console.log('Transcription>>>>>^^^ ', transcription)

        // Optionally, store the transcription in Firestore or return it to the client
        return transcription
    } catch (error) {
        logger.error(error)
        console.error('ERROR:', error)
        return null
    }
}


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
        console.log('Transcription>>>>> ', transcription)

        // Optionally, store the transcription in Firestore or return it to the client
        return transcription
    } catch (error) {
        logger.error(error)
        console.error('ERROR:', error)
        return null
    }
})

exports.helloWorld = functions.https.onRequest((request: any, response: any) => {
    response.send("Hello from Firebase!");
});


exports.transcribeAudioFromURL = functions.https.onRequest(async (req: any, res: any) => {
  // Enable CORS for your function if it's going to be called from a browser
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else if (req.method === 'GET') {
        try {
        const audioUrl = req.query.url; // Assume URL is provided as a query parameter
        if (!audioUrl) {
            return res.status(400).send({ error: 'No URL provided' });
        }

        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error('Failed to fetch audio file from URL');
        }

        const audioBuffer = await audioResponse.buffer();
        const audioBytes = audioBuffer.toString('base64');

        const audio = {
            content: audioBytes,
        };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        };
        const request = {
            audio: audio,
            config: config,
        };

        const [response] = await speechClient.recognize(request);
        const transcription = response.results
            .map((result: any) => result.alternatives[0].transcript)
            .join('\n');

        res.status(200).send({ transcription });
        } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: (error as Error).message });
        }
    } else {
        res.status(405).send({ error: 'Method Not Allowed' });
    }
});
