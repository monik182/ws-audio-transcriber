from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def analyze_text(text):
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

    response = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=prompt,
        max_tokens=1500
    )
    print("Analysis: ", response.choices[0].text.strip())

def transcribe_audio(audio_file_path):
    audio_file= open(audio_file_path, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file,
        response_format="text",
    )
    print(transcription)
    return transcription
