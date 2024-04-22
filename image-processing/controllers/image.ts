import { NextFunction, Request, Response } from 'express';
import imageHelper from '../helperFuncs/imageHelper';
// Test Function:
const getTest = async (req: Request, res: Response) => {
    try{
        res.status(200).json({Success : "Successful Test for cloud run deployment"})
    } catch(error){
        console.error('Error retrieving test:', error);
        res.status(500).json({ error: 'Could not setup test successfully' });
    } 
}

const getImageText = async (req: Request, res: Response) => {
    try{
        if (!req.body) {
            const msg = 'no Pub/Sub message received';
            console.error(`error: ${msg}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
          }
          if (!req.body.message || !req.body.message.data) {
            const msg = 'invalid Pub/Sub message format';
            console.error(`error: ${msg}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
          }
        
          // Decode the Pub/Sub message.
          const pubSubMessage = req.body.message;
          let data;
          try {
            data = Buffer.from(pubSubMessage.data, 'base64').toString().trim();
            data = JSON.parse(data);
          } catch (err) {
            const msg =
              'Invalid Pub/Sub message: data property is not valid base64 encoded JSON';
            console.error(`error: ${msg}: ${err}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
          }
        
          // Validate the message is a Cloud Storage event.
          if (!data.name || !data.bucket) {
            const msg =
              'invalid Cloud Storage notification: expected name and bucket properties';
            console.error(`error: ${msg}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
          }
        
          try {
            const detections = await imageHelper.getImageTextOCR(data);
            res.status(204).send(detections);
          } catch (err) {
            console.error(`error: Get image OCR text: ${err}`);
            res.status(500).send();
          }
    } catch(error){
        console.error('Error getting image text:', error);
        res.status(500).json({ error: 'Could not retrieve image text' });
    } 
}


const imageController = {
    getImageText,
    getTest,
};

export { imageController as default };