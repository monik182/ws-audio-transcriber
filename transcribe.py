import speech_recognition as sr
from pydub import AudioSegment

def transcribe_audio(audio_path, language='en-US'):
    # Initialize the recognizer
    recognizer = sr.Recognizer()

    # Load the audio file
    sound = AudioSegment.from_ogg(audio_path)
    sound = sound.set_channels(1)  # Ensure audio is mono
    sound.export("/tmp/temp.wav", format="wav")  # Export as WAV

    # Load the exported WAV file
    with sr.AudioFile("/tmp/temp.wav") as source:
        audio_data = recognizer.record(source)

    # Recognize the speech in the audio
    try:
        # Detect the language
        if language == 'es':
            lang_code = 'es-ES'
        else:
            lang_code = 'en-US'
        
        text = recognizer.recognize_google(audio_data, language=lang_code)
        print("Transcription: " + text)
    except sr.UnknownValueError:
        print("Google Speech Recognition could not understand audio")
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")

# Usage example
if __name__ == "__main__":
    import sys
    audio_file_path = sys.argv[1]  # Path to the .ogg audio file
    lang = sys.argv[2] if len(sys.argv) > 2 else 'en-US'
    transcribe_audio(audio_file_path, language=lang)
