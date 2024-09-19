# LOG

## Aug 26
Do not remember for long I've been working on this app.
But as of Aug 26, the latest attempts to make the `/transcribe` API were futile.
The next thing to try is to directly send the blob to OpenAI and make it transcribe it.

## Aug 27
Created the openAI transcribe api and is working fine 

## Sep 15
Created the repo
Also created a new extension folder with react 
Finished the UI to save/delete api key
Finished the basic logic to process the audios
Not using the firebase function any more

## Sep 16
Doing tests to avid multiple requests to the same message id
Validate cache first before sending request to OpenAI
Deleting cache that has mocked data, maybe use a different test id for mocks

## Sep 19
Doing tests to avid multiple requests to the same message id
Creating an event queue or delaying the events to prevent multiple requests at once to whisper
