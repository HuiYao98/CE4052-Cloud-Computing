// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
//Import Jimp
const Jimp = require('jimp');
const fs = require('fs');

export async function getTextFromImage(fileName: String) {

  // Creates a client
  const client = new vision.ImageAnnotatorClient({ keyFilename: "../vision_gcs.json" });

  // Performs label detection on the image file
  //const [result] = await client.textDetection('./test_folder/kfc_menu.jpg');

  const bucketName = 'cz4052-uploaded-pictures';
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`);
  const detections = result.textAnnotations;

  detections.forEach((text: any) => console.log(text));

  return JSON.stringify(detections);
  //Debug
  // fs.writeFile('file.txt', JSON.stringify(detections), (err: NodeJS.ErrnoException | null) => {
  //   if (err) throw err;
  //   console.log("Data has been written to file successfully.");
  // });

}
export async function overlayTextOnImage(imagePath: any, jsonData: any, fileName: any) {
  try {
    const image = await Jimp.read(imagePath);

    // //Check if data is an array 
    // const data = Array.isArray(jsonData) ? jsonData : [jsonData];

    // //Remove the overall text
    // const sliceData = data.slice(1);

    const data = JSON.parse(jsonData);
    const sliceData = data.slice(1);

    // Iterate over the jsonData array
    for (const item of sliceData) {
      let { description, boundingPoly } = item;
      const { vertices } = boundingPoly;
      const x = vertices[0].x;
      const y = vertices[0].y;
      const [width, height] = [vertices[1].x - x, vertices[3].y - y];

      // Remove numeric characters from the description
      description = description.replace(/\d/g, '');

      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      //Get text height and width
      const textWidth = Jimp.measureText(font, description);
      const textHeight = Jimp.measureTextHeight(font, description, textWidth);

      // Create a new image for the bounding box
      const boundingBox = new Jimp(textWidth + 10, textHeight + 10, 0xffffffff);
      boundingBox.opacity(0.5); // Set the opacity of the bounding box (0.5 = 50% opacity)

      // Overlay the bounding box on the image
      image.blit(boundingBox, x - 5, y - 5);
      image.print(font, x, y, description);
    }
    await image.writeAsync(`edited${fileName}.jpg`);
    //  await image.writeAsync(`../tele_bot/tempStorage/${fileName}.jpg`);
    console.log('Text overlaid on the image successfully!');
  } catch (error) {
    console.error('Error overlaying text on the image:', error);
  }
}


// const imagePath = './test_folder/kfc_menu.jpg';
// const fileContent = fs.readFileSync('file.txt', 'utf8');

// // Extract the JSON string from the XML-like structure
// //const jsonString = fileContent.match(/<document_content>(.*?)<\/document_content>/s)[1];
// const jsonString = JSON.parse(fileContent);
// overlayTextOnImage(imagePath, jsonString);

// // quickstart().then((data) => {
// //   return overlayTextOnImage(imagePath, data);
// // })
// //   .catch((error) => {
// //     console.error(error);
// //   })

// //quickstart();