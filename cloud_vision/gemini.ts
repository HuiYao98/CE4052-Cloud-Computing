import { getTextFromImage } from "./CloudVision";
import { MyContext } from "../tele_bot/TutorialBot";

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const fs = require('fs');


export async function translatePicture(ctx: MyContext, ocrJson: string) {

    const MODEL_NAME = "gemini-1.0-pro";
    const API_KEY = "AIzaSyD_wdNSycwlM-4T2cm_QYTl-lHjEoQ7OZs";
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

    const jsonData = JSON.parse(ocrJson);
    const translationPrompt = `
        Please translate the "description" field of each object in the provided JSON array from Chinese to English.

        Input JSON:
        ${JSON.stringify(jsonData)}

        Example Output Response format for each object:
        {
        "locations": [],
        "properties": [],
        "mid": "",
        "locale": "",
        "description": "TRANSLATED_DESCRIPTION",
        "score": 0,
        "confidence": 0,
        "topicality": 0,
        "boundingPoly": {
            "vertices": [
            {
                "x": 0,
                "y": 0
            },
            {
                "x": 0,
                "y": 0
            },
            {
                "x": 0,
                "y": 0
            },
            {
                "x": 0,
                "y": 0
            }
            ],
            "normalizedVertices": []
        }
        }

        Please provide the translated JSON array in the response.
        `;
    const result = await chat.sendMessage(translationPrompt);
    const response = result.response;
    console.log(response.text())
    return response.text();
}