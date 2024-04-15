/**
 * TODO(developer): Uncomment this variable before running the sample.
 */
const translator_req_topicName = 'translator_req-text';
const translator_res_topicName = 'translator_res-text';
const translator_res_pullsubscriptionName = 'translator_res_pullsub';
const storage_push_translationImgSvc_topicName = 'translator_req-img';
const translator_reqVoice_topicName = 'translator_req-voice';
const translator_resVoice_topicName = 'translator_res-voice';
const translator_res_pullvoicesubscriptionName = 'translator_res_pullvoicesub';

// Imports the Google Cloud client library
import {PubSub} from '@google-cloud/pubsub';

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

async function createTopic(topicNameOrId: string) {
  // Creates a new topic
  await pubSubClient.createTopic(topicNameOrId);
  console.log(`Topic ${topicNameOrId} created.`);
}

async function createSubscription(
  topicNameOrId: string,
  subscriptionNameOrId: string
) {
  // Creates a new subscription
  await pubSubClient
    .topic(topicNameOrId)
    .createSubscription(subscriptionNameOrId);
  console.log(`Subscription ${subscriptionNameOrId} created.`);
}
// Uncomment each of the functions below (1 at a time) and run the script in the package.json for running this file.
// This is for creating the topic and subscriptions by code (if it is not created in the console)
//createTopic(translator_req_topicName);
//createTopic(translator_res_topicName);
//createSubscription(translator_res_topicName, translator_res_pullsubscriptionName);
//createTopic(storage_push_translationImgSvc_topicName);
//createTopic(translator_reqVoice_topicName);
//createTopic(translator_resVoice_topicName);
createSubscription(translator_resVoice_topicName, translator_res_pullvoicesubscriptionName);