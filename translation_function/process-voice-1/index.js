const functions = require('@google-cloud/functions-framework');

// Imports the Google Cloud client library
const fs = require('fs');
const speech = require('@google-cloud/speech');
// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

const translator_res_topicName = 'translator_res-voice';

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSubVoice', async cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64text = cloudEvent.data.message.data;

  const text = base64text
    ? Buffer.from(base64text, 'base64').toString()
    : 'World';

  console.log(`Text To Translate: ${text}!`);
  const message_input = JSON.parse(text);
  // Audio content need to be encoded into base64 format:
  const contentBuffer = Buffer.from(message_input.audio_content.data);
  const base64ContentString = contentBuffer.toString('base64');
  // Setup config :
  // Reference for config details for telegram audio files: https://medium.com/@allofapiece/java-voice-message-to-text-in-telegram-bot-with-google-speech-to-text-ea861ca263e4 
  const encoding = 'OGG_OPUS'; //telegram audio files follow this format
  const sampleRateHertz = 48000;
  const languageCode = message_input.languageCode; //'en-us'
  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };
  const audio = {
    content: base64ContentString,
  };
  
  const request = {
    config: config,
    audio: audio,
  };


  console.log(`Voice Recording To Transcribe: ${text}!`);
  // Creates a client
  const client = new speech.SpeechClient();
  console.log("Request:" + JSON.stringify(request));
  console.log("Content:" + audio.content);

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log('Transcription: ', transcription)
  const dataToSend = JSON.stringify({content: transcription});

  const dataBuffer = Buffer.from(dataToSend);

  // Creates a client; cache this for further use
  const pubSubClient = new PubSub();

  try {
    const messageId = await pubSubClient
      .topic(translator_res_topicName)
      .publishMessage({data: dataBuffer});
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(
      `Received error while publishing: ${error}`
    );
    process.exitCode = 1;
  }
});