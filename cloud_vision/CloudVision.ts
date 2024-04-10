

async function quickstart() {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient({ keyFilename: "visionkey.json" });

    // Performs label detection on the image file
    const [result] = await client.textDetection('./test_folder/kfc_menu.jpg');
    const detections = result.textAnnotations;

    detections.forEach((text: any) => console.log(text));

    const fs = require('fs');
    fs.writeFile('file.txt', JSON.stringify(detections), (err: NodeJS.ErrnoException | null) => {
        if (err) throw err;
        console.log("Data has been written to file successfully.");
    });
}
quickstart();