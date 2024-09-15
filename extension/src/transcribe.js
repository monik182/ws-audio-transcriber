export default async function transcribeAudio(blob) {
// async function transcribeAudio(blob) {
  const transcription = await fetch(`https://us-central1-ws-audio-transcript.cloudfunctions.net/transcribeWithOpenAI`, {
    method: "POST",
    body: blob,
    headers: {
      "Content-Type": "audio/ogg",
    },
  })
  .then(response => response.json())
  console.log('***********TRNASCIPTION>>>', transcription)
  return transcription;
}

// module.exports = transcribeAudio;
