import config from './endpoint_config';

const functions = require('@google-cloud/functions-framework');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');


export async function translateImgText(data: { [key: string]: string }, base_language: string, target_lanugae: string) {

    console.log("Data to be translated " + data);
    const messageInput = JSON.stringify(data);
    //Settings for te LLM
    const MODEL_NAME = "gemini-1.0-pro";
    const API_KEY = config.GEMINI_API_KEY;
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
    });
    const prompt = `${messageInput}\n

      Can you translate the value for each dictionary entry from ${base_language} to ${target_lanugae}. 
      Please return the result in a json format follow the key, and the value should be the transated text`
        ;
    //Send message and wait for the results
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    console.log("Translation is successful\n" + response.text());
    return response.text();
}