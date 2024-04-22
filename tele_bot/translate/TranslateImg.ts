import { MyContext } from "../TutorialBot";
// Imports the Google Cloud client library
import { PubSub, Message } from '@google-cloud/pubsub';
import { Storage } from '@google-cloud/storage';
import { PhotoSize } from "grammy/types";
import config from '../config/endpoints.config'
import axiosInstance from "../utils/axios";

export async function translateImg(ctx: MyContext, photo : PhotoSize[]) {
    //For Google file storage
    //Create new google cloud storage client
    const storage = new Storage(
        {
            projectId: config.GOOGLE_PROJECT_ID,
            keyFilename: config.CLOUD_STORAGE_KEY_PATH
        }
    );
    //For Google Pub sub
    //Create new Google Pub Sub Client
    const pubsub = new PubSub({
        projectId: config.GOOGLE_PROJECT_ID,
        keyFilename: config.PUBSUB_KEY_PATH
    });


    //Specify bucket name
    const bucketName = config.CLOUD_BUCKET_UPLOADED_PICTURES;

    //check last photo
    const fileId = photo?.[photo.length - 1].file_id

    if (fileId) {
        console.log(config.BASE_TELEGRAM_BOT_API_FILE_ENDPOINT);
        //Get the fileUrl
        const file_info = await ctx.api.getFile(fileId);
        const file_path = file_info.file_path;
        console.log(`/${file_path}`);

        //Download the image
        const response = await axiosInstance.get(`/${file_path}`, { responseType: 'arraybuffer' });
        const photoBuffer = Buffer.from(response.data, 'binary');

        //Upload photo to GCS
        const bucket = storage.bucket(bucketName);
        const blobName = `${fileId}.jpg`
        const blob = bucket.file(blobName);
        await blob.save(photoBuffer, {
            metadata: {
                contentType: 'image/jpeg',
            },
        });

        //get the public URL of the uploaded photo
        const [google_url] = await blob.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 //URL Expiration time is 1 min
        })
        console.log("Photo recieved and uploaded at:" + google_url);

        //Get base language and target language
        const baseLanguage = ctx.session.baseLanguage;
        const targetLanguage = ctx.session.targetLanguage;
        publishPictureLink(pubsub, google_url, bucketName, blobName, baseLanguage, targetLanguage);

        await ctx.reply("Photo recieved and uploaded")

        //Listen for reply
        const subscriptionName = 'translator-res-image2-sub';
        try {
            const subscription = pubsub.subscription(subscriptionName);
            let messageReceived = false;

            const signedUrl = await new Promise<string>((resolve) => {
                const messageHandler = async (message: Message) => {
                    if (!messageReceived) {
                        messageReceived = true;
                        const url = await handleResponse(message);
                        resolve(url);
                        console.log("Signed Url: " + url);
                        subscription.removeListener('message', messageHandler);
                    }
                };

                subscription.on('message', messageHandler);

                // Timeout to unsubscribe if no message is received within a certain time
                setTimeout(() => {
                    if (!messageReceived) {
                        subscription.removeListener('message', messageHandler);
                        resolve('');
                    }
                }, 60000); // TImeout of 60 seconds
            });

            if (signedUrl) {
                // Send the translated image URL back to the user
                await ctx.replyWithPhoto(signedUrl);
            } else {
                await ctx.reply('Failed to receive translated image within the specified time.');
            }
        } catch (error) {
            console.error('Error receiving translated image:', error);
            await ctx.reply('Failed to receive translated image. Please try again.');
        }
    }
}
async function publishPictureLink(pubsub: PubSub, imageLink: String, bucketName: String, blobName: String, baseLanguage: String, targetLanguage: String) {


    const topicName = 'translator-req-img2';

    const messageObject = {
        link: imageLink,
        attributes: {
            bucket_name: bucketName,
            blob_name: blobName,
            base_language: baseLanguage,
            target_lanugae: targetLanguage,
        },
    };
    const data = JSON.stringify(messageObject);
    const dataBuffer = Buffer.from(data);
    try {
        const messageId = await pubsub.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published with message \n ${dataBuffer}`)
    } catch (error) {
        console.error("Error publishing message: ", error);
    }

}

// async function waitForTranslatedImage(pubsub: PubSub, subscriptionName: string, timeout: number): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const subscription = pubsub.subscription(subscriptionName);
//         let messageHandler: (message: Message) => void;

//         const timer = setTimeout(() => {
//             subscription.removeListener('message', messageHandler);
//             reject(new Error('Timeout waiting for translated image'));
//         }, timeout * 1000);

//         messageHandler = (message: Message) => {
//             console.log(`Received message ${message.id}:`);
//             console.log(`\tData: ${message.data}`);
//             console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);

//             const messageData = JSON.parse(message.data.toString());
//             const translatedImageUrl = messageData.translatedImageUrl;

//             clearTimeout(timer);
//             subscription.removeListener('message', messageHandler);
//             if (translatedImageUrl && typeof translatedImageUrl === 'string') {
//                 resolve(translatedImageUrl);
//             } else {
//                 resolve('');
//             }
//             message.ack();
//         };

//         subscription.on('message', messageHandler);
//     });
//}


async function handleResponse(message: Message) {
    // Process the received message data
    const data = JSON.parse(message.data.toString());
    const signedUrl = data.attributes.url;

    // Acknowledge the message
    message.ack();

    // Return the signed URL
    return signedUrl;
}