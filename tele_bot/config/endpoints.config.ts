import dotenv from 'dotenv'; 
dotenv.config();

// This stores the config for the .env file

const config = {
    TELEGRAM_BOT_API_TOKEN: process.env.TELEGRAM_BOT_API_TOKEN ?? '',
    CLOUD_BUCKET_UPLOADED_PICTURES: process.env.CLOUD_BUCKET_UPLOADED_PICTURES ?? '',
    BASE_TELEGRAM_BOT_API_FILE_ENDPOINT: `${process.env.BASE_TELEGRAM_BOT_API_FILE_ENDPOINT}${process.env.TELEGRAM_BOT_API_TOKEN}` ?? '',
    CLOUD_STORAGE_KEY_PATH: `${process.env.GOOGLE_CLOUD_STORAGE_KEY_PATH}` ?? '',
    PUBSUB_KEY_PATH: `${process.env.GOOGLE_PUBSUB_KEY_PATH}` ?? '',
    GOOGLE_PROJECT_ID: `${process.env.GOOGLE_PROJECT_ID}` ?? ''

}
export default config;

