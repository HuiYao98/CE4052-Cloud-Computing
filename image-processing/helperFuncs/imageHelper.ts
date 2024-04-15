'use strict';

// [START cloudrun_imageproc_handler_setup]
// [START run_imageproc_handler_setup]

import * as vision from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const client = new vision.ImageAnnotatorClient();

// [END run_imageproc_handler_setup]
// [END cloudrun_imageproc_handler_setup]

// [START cloudrun_imageproc_handler_analyze]
// [START run_imageproc_handler_analyze]
// Blurs uploaded images that are flagged as Adult or Violence.
const getImageTextOCR = async (event: any) => {
  // This event represents the triggering Cloud Storage object.
  const object = event;
  const file = storage.bucket(object.bucket).file(object.name);
  const filePath = `gs://${object.bucket}/${object.name}`;
  console.log(`Analyzing ${file.name}.`);

  try {
    // Performs text detection on the gcs file
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    console.log('Text:');
    if (detections){
        // This is the output of OCR Vision API for the picture
        console.log(detections)
        return detections;
    }
    else{
        console.log("Detection failed")
    }
  } catch (err) {
    console.error(`Failed to analyze ${file.name}.`, err);
    throw err;
  }
};
// [END run_imageproc_handler_analyze]
// [END cloudrun_imageproc_handler_analyze]

// [START cloudrun_imageproc_handler_blur]
// [START run_imageproc_handler_blur]
/* Not being used currently, taken from tutorial
// Blurs the given file using ImageMagick, and uploads it to another bucket.
const blurImage = async (file: any, blurredBucketName: string) => {
  const tempLocalPath = `/tmp/${path.parse(file.name).base}`;

  // Download file from bucket.
  try {
    await file.download({ destination: tempLocalPath });
    console.log(`Downloaded ${file.name} to ${tempLocalPath}.`);
  } catch (err) {
    throw new Error(`File download failed: ${err}`);
  }

  await new Promise<void>((resolve, reject) => {
    gmSubClass(tempLocalPath)
      .blur(0, 16)
      .write(tempLocalPath, (err, stdout) => {
        if (err) {
          console.error('Failed to blur image.', err);
          reject(err);
        } else {
          console.log(`Blurred image: ${file.name}`);
          resolve(stdout as any);
        }
      });
  });

  // Upload result to a different bucket, to avoid re-triggering this function.
  const blurredBucket = storage.bucket(blurredBucketName);

  // Upload the Blurred image back into the bucket.
  const gcsPath = `gs://${blurredBucketName}/${file.name}`;
  try {
    await blurredBucket.upload(tempLocalPath, { destination: file.name });
    console.log(`Uploaded blurred image to: ${gcsPath}`);
  } catch (err) {
    throw new Error(`Unable to upload blurred image to ${gcsPath}: ${err}`);
  }

  // Delete the temporary file.
  const unlink = promisify(fs.unlink);
  return unlink(tempLocalPath);
};
*/
// [END run_imageproc_handler_blur]
// [END cloudrun_imageproc_handler_blur]

const imageHelper = { 
    getImageTextOCR, 
    //blurImage 
};
export { imageHelper as default };