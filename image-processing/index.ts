// [START cloudrun_imageproc_server]
// [START run_imageproc_server]
import express from 'express';
import imageRouter from './routes/image'

// Create the app here -- Starting point
const app = express();

// This middleware is available in Express v4.16.0 onwards
app.use(express.json());
const PORT = parseInt(process.env.PORT ?? "8080") || 8080;

// List of different routes available on the backend:
// app.use('/', );
app.use('/image', imageRouter);
// app.use('/items', ItemRouter);

app.listen(PORT, () =>
  console.log(`nodejs-image-processing listening on port ${PORT}`)
);
// [END run_imageproc_server]
// [END cloudrun_imageproc_server]
