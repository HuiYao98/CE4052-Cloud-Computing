import json
from PIL import ImageFont, ImageDraw, Image
from google.cloud import storage
from io import BytesIO
from flask import Flask, request, jsonify
from google.oauth2 import service_account
import os
import datetime

from dotenv import load_dotenv
#Load the environment variable from the .env file
load_dotenv()

app = Flask(__name__)


# Create a credentials object from a service account file
gcs_credentials_path = os.environ.get("GOOGLE_CLOUD_STORAGE_CREDENTIALS")
credentials = service_account.Credentials.from_service_account_file(gcs_credentials_path)
# Instantiate a client
storage_client = storage.Client(credentials=credentials)

# Convert picture to png
def convertToPNG(im):
    with BytesIO() as f:
        im.save(f, format='png')
        return f.getvalue()
    
@app.route("/")
def hello_world():
    """Example Hello World route."""
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"


@app.route('/overlay-text', methods=['POST'])
def overlayTextOnImage():
    # Get the JSON data from the request body
    request_json = request.get_json()

    # Check if the JSON Data is provided
    if request_json is None:
        return jsonify({"error": "No JSON data provided in the request body"}), 400

    bucket_name = request_json.get("bucket")
    blob_name = request_json.get("blob")
    text = request_json.get('text')


    # convert dictionary string to dictionary
    jsonText = json.loads(text)
    # Drop the first value
    document_content = jsonText[1:]

    # Get the picture
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    with blob.open(mode='rb') as file:
        # Load the original image and convert it in RGBA
        with Image.open(file).convert("RGBA") as base:
            # make a blank image for the text, initialized to transparent text color
            txt = Image.new("RGBA", base.size, (255, 255, 255, 0))
            # Create a drawing context
            draw = ImageDraw.Draw(txt)

            # Iterate over each detected word
            for word_data in document_content:
                print(word_data)
                description = word_data.get('description')
                bounding_poly = word_data.get('boundingPoly')

                # Extract the bounding box coordinates
                vertices = bounding_poly['vertices']
                x_coords = [vertex['x'] for vertex in vertices]
                y_coords = [vertex['y'] for vertex in vertices]

                # Extract the top-left and bottom-right coordinates
                top_left_x, top_left_y = vertices[3]['x'], vertices[3]['y']
                bottom_right_x, bottom_right_y = vertices[1]['x'], vertices[1]['y']

                # Calculate the font size based on the bounding box dimensions
                box_width = bottom_right_x - top_left_x
                box_height = top_left_y - bottom_right_y

                initial_font_size  = int(min(box_width, box_height) * 0.8)
                # Create a font object with the calculated size
                font = ImageFont.truetype("Arial-Unicode-Regular.ttf", initial_font_size )

                 
                # Calculate the dimensions of the translated text
                text_width = font.getsize(description)[0]
                text_height = font.getsize(description)[1]

                # Adjust the font size if the text exceeds the bounding box dimensions
                if text_width > box_width or text_height > box_height:
                    # Calculate the scaling factor
                    scale_factor = min(box_width / text_width, box_height / text_height)
                    
                    # Calculate the adjusted font size
                    adjusted_font_size = int(initial_font_size * scale_factor)
                    
                    # Create a new font object with the adjusted size
                    font = ImageFont.truetype("Arial-Unicode-Regular.ttf", adjusted_font_size)
                        
                # Draw a translucent background rectangle
                background_color = (255, 255, 255, 128)  # White color with 50% opacity
                draw.rectangle([(top_left_x, bottom_right_y), (bottom_right_x, top_left_y)], fill=background_color)

                # Draw the text on top of the translucent background
                text_color = (0, 0, 0)  # Black color
                text_position = (top_left_x, bottom_right_y)
                draw.text(text_position, description, font=font, fill=text_color)

            # Uploading the image back to gcs
            out = Image.alpha_composite(base, txt)
            modified_image_data = convertToPNG(out)

            #change the bucketname 
            edited_bucket_name = "cz4052-edited-pictures"

            bucket = storage_client.get_bucket(edited_bucket_name)
            blob = bucket.blob(blob_name)
            blob.upload_from_string(modified_image_data)
            #Expire after 120 seconds
            signUrl = blob.generate_signed_url(expiration=datetime.timedelta(minutes=2)) 

    # Return the modified image url as the response
    response = {
        "signedUrl": signUrl
    }
    return jsonify(response), 200

if __name__ == '__main__':
    print("Running")
    app.run(host='0.0.0.0', port=8080)