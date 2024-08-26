export default async function transcribeAudio(url) {
  const transcription = await fetch(`http://127.0.0.1:5001/ws-audio-transcript/us-central1/transcribeAudioFromURL?url=${encodeURI(url)}`)
  .then(response => response.text())
  console.log('TRNASCIPTION>>>', transcription)
}