const { SpeechClient } = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
// const axios = require('axios');
// const util = require('util');
// const path = require('path');

// Configure ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize the Google Cloud client
const client = new SpeechClient();


export default async function transcribeGoogle(audioUrl) {
  console.log('audioUrl>>>>>>>.', audioUrl)
  try {
    // Parse the event to get the audio URL
    // const { audioUrl } = JSON.parse(event.body);

    // Download the audio file from the URL
    const audioFilePath = `/tmp/audiofile`;
    await downloadFileFromUrl(audioUrl, audioFilePath);

    // Convert the audio file to FLAC format
    // const flacFilePath = audioFilePath + '.flac';
    const flacFilePath = audioFilePath.replace('.ogg', '.flac');
    await convertToFlac(audioFilePath, flacFilePath);

    // Transcribe the audio file
    const transcription = await transcribeAudio(flacFilePath);

    return {
      statusCode: 200,
      body: JSON.stringify({ transcription }),
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// exports.handler = async (event) => {
//   try {
//     // Parse the event to get the audio URL
//     const { audioUrl } = JSON.parse(event.body);

//     // Download the audio file from the URL
//     const audioFilePath = `/tmp/audiofile`;
//     await downloadFileFromUrl(audioUrl, audioFilePath);

//     // Convert the audio file to FLAC format
//     const flacFilePath = audioFilePath + '.flac';
//     await convertToFlac(audioFilePath, flacFilePath);

//     // Transcribe the audio file
//     const transcription = await transcribeAudio(flacFilePath);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ transcription }),
//     };
//   } catch (error) {
//     console.error('Error transcribing audio:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message }),
//     };
//   }
// };

async function downloadFileFromUrl(url, downloadPath) {
  const writer = fs.createWriteStream(downloadPath);
  const response = await fetch({
    url,
    method: 'GET',
    // responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function convertToFlac(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('flac')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

async function transcribeAudio(filePath) {
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: 'FLAC',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}
