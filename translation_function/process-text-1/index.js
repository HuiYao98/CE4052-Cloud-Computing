const functions = require('@google-cloud/functions-framework');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

const translator_res_topicName = 'translator_res-text';

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub', async cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64text = cloudEvent.data.message.data;

  const text = base64text
    ? Buffer.from(base64text, 'base64').toString()
    : 'World';

  console.log(`Text To Translate: ${text}!`);
  const message_input = JSON.parse(text);
  const MODEL_NAME = "gemini-1.0-pro";
  const API_KEY = "GOOGLE_AI_STUDIO_API_KEY";
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Translate this message from English to Chinese. \n\nMessage To Translate:\"When do you want to go out to eat?\"\n\nExample Output Response format:\n{translated_text: \"TRANSLATED_TEXT\", base_language: \"BASE_LANGUAGE\", target_language:\"TARGET_LANGUAGE\"}"}],
      },
      {
        role: "model",
        parts: [{ text: "{\"translated_text\": \"你什么时候想出去吃饭？\", \"base_language\": \"English\", \"target_language\":\"Chinese\"}"}],
      },
    ],
  });
  const prompt = `Translate this message from ${message_input.base} to ${message_input.target}.
    Message to Translate: ${message_input.msg}
    Example Output Response format: {"translated_text": "厕所在哪里？", "base_language": "English", "target_language":"Chinese"}
  `;
  
  const result = await chat.sendMessage(prompt);
  const response = result.response;
  console.log(response.text());
  const dataBuffer = Buffer.from(response.text());

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
  // Recieved this: "Text To Translate: {"base":"English","target":"Spanish","msg":"test message"}!"
});