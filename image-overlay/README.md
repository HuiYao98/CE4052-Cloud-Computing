Certainly! Here's the updated README.md:

---

# Image Text Overlay Service

This service overlays text onto images stored in Google Cloud Storage (GCS) buckets. It utilizes Flask, Google Cloud Storage Python client library, and Pillow (PIL fork) for image processing.

## Requirements

- Python 3.9 or higher
- Docker (optional, for containerization)

## Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/your-username/image-text-overlay-service.git
    ```

2. Navigate to the project directory:

    ```bash
    cd image-text-overlay-service
    ```

3. Install dependencies using pip:

    ```bash
    pip install -r requirements.txt
    ```

## Configuration

1. Create a `.env` file in the root directory of the project.

2. Define environment variables in the `.env` file:

    ```plaintext
    GOOGLE_CLOUD_STORAGE_CREDENTIALS=/path/to/gcs.json
    ```

    Replace `/path/to/gcs.json` with the path to your Google Cloud Storage service account key file.

## Usage

### Running Locally

To run the Flask application locally, execute:

```bash
python app.py
```

The application will be accessible at `http://localhost:8080`.

### Docker

To build a Docker image and run the application in a container, execute:

```bash
docker build -t image-text-overlay-service .
docker run -p 8080:8080 -e GOOGLE_CLOUD_STORAGE_CREDENTIALS=/path/to/gcs.json image-text-overlay-service
```

Replace `/path/to/gcs.json` with the path to your Google Cloud Storage service account key file.

## Endpoints

### 1. `GET /`

- Description: A simple "Hello World" endpoint.
- Parameters: None
- Returns:
  - `200 OK`: A greeting message.

### 2. `POST /overlay-text`

- Description: Overlay text on an image stored in a GCS bucket.
- Parameters:
  - `bucket`: Name of the GCS bucket where the image is stored.
  - `blob`: Name of the image file (blob) in the specified bucket.
  - `text`: JSON-encoded list of detected words and their bounding polygons.
- Returns:
  - `200 OK`: Signed URL of the modified image with overlaid text.
  - `400 Bad Request`: If JSON data is not provided in the request body.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.

