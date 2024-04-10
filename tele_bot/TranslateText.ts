import { MyContext } from "./TutorialBot";
// Imports the Google Cloud client library
import { PubSub, Message } from '@google-cloud/pubsub';

export interface message_res {
    id: string;
    data: string;
    attributes : string;
}
export async function translateText(ctx : MyContext, messageText : String) {

    const translator_res_pullsubscriptionName = 'translator_res_pullsub';
    const timeout = 60
    // Creates a client for publishing or subscribing
    const pubSubClient = new PubSub();

    const topicNameOrId = 'translator_req-text';
    const data = JSON.stringify({base: ctx.session.baseLanguage, target: ctx.session.targetLanguage, msg: messageText});

    console.log(data);
    const dataBuffer = Buffer.from(data);
    // Publishing translation message to topic:
    const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publishMessage({data: dataBuffer});
    console.log(`Message ${messageId} published for message to translate: ${data}`);
    
    // References an existing subscription - Subscribe to translation response topic
    const subscription = pubSubClient.subscription(translator_res_pullsubscriptionName);
  
    // Create an event handler to handle messages
    let messageCount = 0;
    const messageHandler = async (message:Message) => {
      console.log(`Received message ${message.id}:`);
      console.log(`Data: ${message.data}`);
      const translatedText = message.data.toString();  // Example response
      // Process the json object recieved, need to do it like this as keys do not have double quotes
      let translatedJson;
      try{
        translatedJson = JSON.parse(translatedText);
      }
      catch(e){
        console.log("Error: " + e);
        console.log("Try to remedy json parsing...");
        translatedJson = JSON.parse(
            '{' +
                translatedText
                .trim()
                .slice(1, -1)
                .split(',')
                .map((kv) => {
                const [key, value] = kv.trim().split(':');
                return `"${key}":${value.replace(/'/g, '"')}`;
                })
                .join(',') +
            '}'
        );
      }
      await ctx.reply(`Translation Successful! 
Translated Text from <b>${translatedJson.base_language}</b> to <b>${translatedJson.target_language}</b>: 
${translatedJson.translated_text}`, { parse_mode: "HTML" });
      messageCount += 1;
      
  
      // "Ack" (acknowledge receipt of) the message
      message.ack();
      // Remove the listener from the subscription after recieving one translation message:
      subscription.removeListener('message', messageHandler);
      console.log(`${messageCount} message(s) received. Stopped listening to the topic.`);
    };
  
    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);
  
    // Wait a while for the subscription to run - Set timeout duration
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
      console.log(`${messageCount} message(s) received.`);
    }, timeout * 1000);
}