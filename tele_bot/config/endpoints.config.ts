import dotenv from 'dotenv'; 
dotenv.config();

// This stores the config for the .env file

const config = {
    TELEGRAM_BOT_API_TOKEN: process.env.TELEGRAM_BOT_API_TOKEN ?? '',
    CLOUD_BUCKET_UPLOADED_PICTURES: process.env.CLOUD_BUCKET_UPLOADED_PICTURES ?? '',
    BASE_TELEGRAM_BOT_API_FILE_ENDPOINT: `${process.env.BASE_TELEGRAM_BOT_API_FILE_ENDPOINT}${process.env.TELEGRAM_BOT_API_TOKEN}` ?? '',
}
export default config;