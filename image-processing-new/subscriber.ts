import { PubSub, Message } from '@google-cloud/pubsub';
import { getImageTextFromLink, processVisionAPIJson, overlayTextOnImage, processJson, publishEditedPictureLink } from './imageHelper';
import { translateImgText } from './translationHelper';
import config from './endpoint_config';

const projectId = config.GOOGLE_PROJECT_ID;
const pubsub = new PubSub({ projectId });

const path = ""

async function handleMessage(message: Message) {
    // Process the received message data
    const data = JSON.parse(message.data.toString());
    console.log('Received message:', data);
    const { link, attributes } = data;
    const { bucket_name, blob_name, base_language, target_lanugae } = attributes;

    try {
        //Get Vision API
        const ocrData = await getImageTextFromLink(link);
        if (ocrData?.length !== 0) {
            //Pocess the data
            const ocrDataString = JSON.stringify(ocrData);
            const processedOCRData = await processVisionAPIJson(ocrDataString);
            //Get the translation
            const translatedText = await translateImgText(processedOCRData, base_language, target_lanugae);
            //Combined the translatedText with the coordinates
            const processedTranslatedText = await processJson(ocrDataString, translatedText);
            //send to python function to overlay
            const response = await overlayTextOnImage(path, bucket_name, blob_name, processedTranslatedText);
            //Check the response status 
            if (response && response.status === 200) {
                const signedUrl = response.data.signedUrl;
                const targetBucketName = config.CLOUD_BUCKET_EDITED_PICTURES;
                console.log('Response received successfully');
                console.log('URL:', signedUrl);

                // Pass the blob_name to another function
                publishEditedPictureLink(signedUrl);

            } else {
                console.log('Request failed with status:', response.status);
            }
        }

        // Acknowledge the message to mark it as processed
        message.ack();
    }
    catch (error) {
        console.error(error);
    }
}

const subscriptionName = 'translator-req-img2-sub';

async function subscribeToTopic() {
    const subscription = pubsub.subscription(subscriptionName);

    subscription.on('message', handleMessage);
    subscription.on('error', (err) => {
        console.error('Subscription error:', err);
    });

    console.log(`Listening for messages on subscription ${subscriptionName}`);

    // Keep the process running
    await new Promise((resolve) => {
        process.on('SIGINT', () => {
            console.log('Stopping the subscription...');
            subscription.close().then(() => {
                console.log('Subscription stopped.');
                resolve(null);
            });
        });
    });
}

// Start the subscription
subscribeToTopic().catch((err) => {
    console.error('Error occurred:', err);
    process.exit(1);
});