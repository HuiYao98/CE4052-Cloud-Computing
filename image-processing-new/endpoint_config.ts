import dotenv from 'dotenv';
dotenv.config();

const config = {
    CLOUD_BUCKET_EDITED_PICTURES: process.env.CLOUD_STORAGE_EDITED_PICTURE_BUCKET_NAME ?? "",
    VISION_GCS_KEY_PATH: process.env.VISION_GCS_API_KEY_PATH ?? "",
    PUBSUB_KEY_PATH: process.env.PUBSUB_KEY_PATH ?? "",
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID ?? "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
    IMAGE_OVERLAY_API_ENPOINT: process.env.IMAGE_OVERLAY_API_ENPOINT ?? ""
}
export default config;
