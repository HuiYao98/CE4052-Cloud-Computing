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
            projectId: "prime-micron-419504",
            keyFilename: "../key.json"
        }
    );

    //Specify bucket name
    const bucketName = config.CLOUD_BUCKET_UPLOADED_PICTURES;

    //check last photo
    const fileId = photo?.[photo.length - 1].file_id

    if(fileId){
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
        const blob = bucket.file(`${fileId}.jpg`);
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
        await ctx.reply("Photo recieved and uploaded" );
    }
}