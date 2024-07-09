import sys
from transcribe import transcribe_audio
from openai_utils import analyze_text, transcribe_audio as openai_transcribe_audio

if __name__ == "__main__":
    audio_file_path = sys.argv[1]
    lang = 'en-US'
    use_openai = False

    if len(sys.argv) > 2:
        if sys.argv[2].lower() == 'openai':
            use_openai = True
        else:
            lang = sys.argv[2]
        
    if len(sys.argv) > 3:
        use_openai = sys.argv[3].lower() == 'openai'

    if use_openai:
      transcribed_text = openai_transcribe_audio(audio_file_path)
    else:
      transcribed_text = transcribe_audio(audio_file_path, language=lang)
    if transcribed_text:
        analyze_text(transcribed_text)
