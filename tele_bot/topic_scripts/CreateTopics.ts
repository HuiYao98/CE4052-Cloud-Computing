/**
 * TODO(developer): Uncomment this variable before running the sample.
 */
const translator_req_topicName = 'translator_req-text';
const translator_res_topicName = 'translator_res-text';
const translator_res_pullsubscriptionName = 'translator_res_pullsub';

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
//createTopic(translator_req_topicName);
//createTopic(translator_res_topicName);
createSubscription(translator_res_topicName, translator_res_pullsubscriptionName);