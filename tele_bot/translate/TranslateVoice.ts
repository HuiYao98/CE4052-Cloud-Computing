import { MyContext } from "../TutorialBot";
// Imports the Google Cloud client library
import { PubSub, Message } from '@google-cloud/pubsub';
import { Voice } from "grammy/types";
import config from '../config/endpoints.config'
import axiosInstance from "../utils/axios";
import { translateText } from "./TranslateText";

export async function translateVoice(ctx: MyContext, voice : Voice, languagecode : string) {

    const duration = voice.duration; // in seconds
    await ctx.reply(`Your voice message is ${duration} seconds long.`);

    const fileId = voice.file_id;

    if(fileId){
        // Get the fileUrl
        const file_info = await ctx.api.getFile(fileId);
        const file_path = file_info.file_path;
        console.log(`/${file_path}`);
        console.log(config.BASE_TELEGRAM_BOT_API_FILE_ENDPOINT + `/${file_path}`);

        // Download the voice recording
        const response = await axiosInstance.get(`/${file_path}`, { responseType: 'arraybuffer' });
        // Need to send in binary:
        const voiceBuffer = Buffer.from(response.data, 'binary');

        const data = JSON.stringify({audio_content: voiceBuffer, languageCode: languagecode})
        const dataBuffer = Buffer.from(data);
        // Creates a client for publishing or subscribing
        const pubSubClient = new PubSub();

        const topicNameOrId = 'translator_req-voice';
        const translator_res_pullvoicesubscriptionName = 'translator_res_pullvoicesub';
        const timeout = 60

        // Publishing translation message to topic:
        const messageId = await pubSubClient
            .topic(topicNameOrId)
            .publishMessage({data: dataBuffer});
        console.log(`Message ${messageId} published for message to translate: ${data}`);

        // References an existing subscription - Subscribe to translation response topic
        const subscription = pubSubClient.subscription(translator_res_pullvoicesubscriptionName);
    
        // Create an event handler to handle messages
        let messageCount = 0;
        const messageHandler = async (message:Message) => {
            console.log(`Received message ${message.id}:`);
            console.log(`Data: ${message.data}`);
            const transcribedText = message.data.toString();  // Example response
            // Process the json object recieved, need to do it like this as keys do not have double quotes
            let transcribedJson;
            try{
                transcribedJson = JSON.parse(transcribedText);
            }
            catch(e){
                console.log("Error: " + e);
                subscription.removeListener('message', messageHandler);
                return;
            }
            await ctx.reply(`Translation Successful! 
    Transcribed Text from Recording is: <b>${transcribedJson.content}</b>`, { parse_mode: "HTML" });
            messageCount += 1;
            
        
            // "Ack" (acknowledge receipt of) the message
            message.ack();
            // Remove the listener from the subscription after recieving one translation message:
            subscription.removeListener('message', messageHandler);
            console.log(`${messageCount} message(s) received. Stopped listening to the topic.`);
            
            // Once we get the transcribed text, we send the text for translation. We assume target language to be what is configured in the config.
            await translateText(ctx, transcribedJson.content.toString());
        };
    
        // Listen for new messages until timeout is hit
        subscription.on('message', messageHandler);
    
        // Wait a while for the subscription to run - Set timeout duration
        setTimeout(() => {
            subscription.removeListener('message', messageHandler);
            console.log(`${messageCount} message(s) received.`);
        }, timeout * 1000);
    }
}