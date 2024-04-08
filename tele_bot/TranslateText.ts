import { Context } from "grammy";
import { BotConfig } from "./TutorialBot";
// Imports the Google Cloud client library
import { PubSub, Message } from '@google-cloud/pubsub';

export interface message_res {
    id: string;
    data: string;
    attributes : string;
}
export async function translateText(ctx : Context, messageText : String, botconfig: BotConfig) {

    const translator_res_pullsubscriptionName = 'translator_res_pullsub';
    const timeout = 60
    // Creates a client; cache this for further use
    const pubSubClient = new PubSub();

    const topicNameOrId = 'translator_req-text';
    const data = JSON.stringify({base: botconfig.baseLanguage, target: botconfig.targetLanguage, msg: messageText});

    console.log(data);
    const dataBuffer = Buffer.from(data);
    // ... Logic for processing text and calling translation API ...
    const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publishMessage({data: dataBuffer});
    console.log(`Message ${messageId} published for message to translate: ${data}`);
    
    // References an existing subscription
    const subscription = pubSubClient.subscription(translator_res_pullsubscriptionName);
  
    // Create an event handler to handle messages
    let messageCount = 0;
    const messageHandler = async (message:Message) => {
      console.log(`Received message ${message.id}:`);
      console.log(`Data: ${message.data}`);
      const translatedText = message.data;  // Example response
      
      await ctx.reply(translatedText.toString());
      messageCount += 1;
  
      // "Ack" (acknowledge receipt of) the message
      message.ack();
    };
  
    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);
  
    // Wait a while for the subscription to run. (Part of the sample only.)
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
      console.log(`${messageCount} message(s) received.`);
    }, timeout * 1500);
}