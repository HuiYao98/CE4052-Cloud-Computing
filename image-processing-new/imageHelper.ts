import * as vision from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';

const axios = require('axios');

const storage = new Storage();
const client = new vision.ImageAnnotatorClient();

import { PubSub, Message } from '@google-cloud/pubsub';
import config from './endpoint_config';

//Function to use Vision API to perform OCR on text
//Accepts a link to the picture
//Returns the detection object 
export async function getImageTextFromLink(pictureLink: string) {
    const client = new vision.ImageAnnotatorClient();
    try {
        // Performs text detection on the gcs file
        const [result] = await client.textDetection(pictureLink);
        const detections = result.textAnnotations;
        console.log('Text:');
        if (detections) {
            // This is the output of OCR Vision API for the picture
            console.log(detections)
            return detections;
        }
        else {
            console.log("Detection failed")
        }
    } catch (err) {
        console.error(`Failed to analyze`, err);
        throw err;
    }
}

//Function to process the Vision API JSON and extract only the description field (text)
//Accepts the detection object
//Returns a dictionary with the only the text
export async function processVisionAPIJson(response: any) {
    const dataString = response.toString();
    const jsonData = JSON.parse(dataString);

    const textDictionary: { [key: string]: string } = {};
    let index = 0;
    jsonData.forEach((item: any) => {
        const description = item.description;
        const processedDescription = description.replace(/\n/g, ' ');
        textDictionary[index] = processedDescription;
        index++;
    });

    return textDictionary;
}
//Function to do a post method call to the image overlay service
//Pass the bucketname, blob (object) name and the text and coordinates to the function 
export async function overlayTextOnImage(path: string, bucketName: string, blobName: string, text: string) {
    try {
        const url = config.IMAGE_OVERLAY_API_ENPOINT;


        console.log(`Text to overlay: ${text}`);

        const requestData = {
            bucket: bucketName,
            blob: blobName,
            text: text
        };

        const response = await axios.post(url, requestData);

        console.log(response.data);
        return response;
    } catch (error) {
        console.error("Error calling cloud function: ", error);
    }
}

//Function to replace the description field in the original Vision API JSON file with the translated text
//Accepts the original text, and replacement text.
//Returns the updated JSON
export async function processJson(originalText: any, replacementText: any) {

    const jsonData = JSON.parse(originalText);
    const replacementJson = JSON.parse(replacementText);

    console.log("Original data: " + jsonData);
    console.log("Replacement data " + replacementJson);

    try {
        for (const [key, value] of Object.entries(replacementJson)) {
            jsonData[key].description = replacementJson[key];
        }

        //Conver the json object back to string
        return JSON.stringify(jsonData);
    }
    catch (error) {
        console.error(error);
        return "";
    }

}
// Function to trigger and publish a message onto the topic
export async function publishEditedPictureLink(url: String) {
    // const projectId = "prime-micron-419504";
    const topicNameOrId = 'translator-res-image2';
    // Instantiates a client
    const pubsub = new PubSub({
        projectId: config.GOOGLE_PROJECT_ID,
        keyFilename: process.env.PUBSUB_KEY_PATH
    });

    const messageObject = {
        attributes: {
            "url": url
        }
    };

    const data = JSON.stringify(messageObject);
    const dataBuffer = Buffer.from(data);

    try {
        //Send the message
        const messageId = await pubsub.topic(topicNameOrId).publish(dataBuffer);
        console.log(`Message ${messageId} published with message \n ${dataBuffer}`)
    } catch (error) {
        console.error("Error publishing message: ", error);
    }

}