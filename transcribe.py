import speech_recognition as sr
from pydub import AudioSegment
import sys
from analyze import analyze_text


def transcribe_audio(audio_path, language='en-US'):
    recognizer = sr.Recognizer()
    sound = AudioSegment.from_ogg(audio_path)
    sound = sound.set_channels(1)
    sound.export("/tmp/temp.wav", format="wav")

    with sr.AudioFile("/tmp/temp.wav") as source:
        audio_data = recognizer.record(source)

    try:
        lang_code = 'es-ES' if language == 'es' else 'en-US'
        text = recognizer.recognize_google(audio_data, language=lang_code)
        print("Transcription: " + text)
        return text
    except sr.UnknownValueError:
        print("Could not understand audio")
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
    return ""

if __name__ == "__main__":
    audio_file_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else 'en-US'
    transcribed_text = transcribe_audio(audio_file_path, language=lang)
    if transcribed_text:
        analyze_text(transcribed_text)
