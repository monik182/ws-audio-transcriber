# import speech_recognition as sr
# from pydub import AudioSegment
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# import sys
# Get the API key from environment variable
def init_openai():
  api_key = os.getenv('OPENAI_API_KEY')

  if api_key is None:
      print("ERROR: API key not found. Please set the OPENAI_API_KEY environment variable.")
  else:
      # Initialize OpenAI with the API key
      openai.api_key = api_key

# def transcribe_audio(audio_path, language='en-US'):
    # recognizer = sr.Recognizer()
    # sound = AudioSegment.from_ogg(audio_path)
    # sound = sound.set_channels(1)
    # sound.export("/tmp/temp.wav", format="wav")

    # with sr.AudioFile("/tmp/temp.wav") as source:
    #     audio_data = recognizer.record(source)

    # try:
    #     lang_code = 'es-ES' if language == 'es' else 'en-US'
    #     text = recognizer.recognize_google(audio_data, language=lang_code)
    #     print("Transcription: " + text)
    #     return text
    # except sr.UnknownValueError:
    #     print("Could not understand audio")
    # except sr.RequestError as e:
    #     print(f"Could not request results; {e}")
    # return ""

def analyze_text(text):
    # try: 
    init_openai()
    prompt = f"""Analyze the following text for emotional tone and other important aspects: {text}. Return the analysis in the following structure
    * Description: <brief description>
    ----------------------------------------------------------------------------------------------------------------------------------------------------------
    * Tone: <identified tone>
    * Emotion <identified emotion>
    * Sentiment (Polarity): <Identified sentiment as positive, negative, or neutral>
    * Confidence Score: <Confidence level in the sentiment prediction>
    * Emotion Categories: <Identified specific emotions such as happiness, sadness, anger, etc.>
    * Subjectivity/Objectivity: <Identified if the text is subjective or objective>
    * Aspect-Based Sentiment: <Identified sentiments related to specific aspects of a product or service>
    * Intensity of Sentiment: <Identified intensity or strength of the expressed sentiment>
    * Temporal Sentiment Tracking: <Changes in sentiment identified over time>
    * Demographic and Psychographic Insights: <Demographic or psychographic details inferred from the text>
    """
    # print('START --------------------------------')
    # print(prompt)
    # print('END --------------------------------')
    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=prompt,
        max_tokens=1500
    )
    # print('RESPONSE FROM OPENAI', response)
    print("Analysis: ", response.choices[0].text.strip())
    # except:
    #   print("ERROR")

def analyze_audio(audio_file_path):
    init_openai()
    # Ensure your audio file path is correctly pointed to the .wav or compatible file
    audio_file= open(audio_file_path, "rb")
    transcription = client.audio.transcriptions.create(
      model="whisper-1", 
      file=audio_file,
      response_format="text",
      # purpose="analysis",
    )
    print(transcription)

# if __name__ == "__main__":
#     audio_file_path = sys.argv[1]
#     lang = sys.argv[2] if len(sys.argv) > 2 else 'en-US'
#     transcribed_text = transcribe_audio(audio_file_path, language=lang)
#     if transcribed_text:
#         analyze_text(transcribed_text)
