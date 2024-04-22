FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Set the environment variable for Google Application Credentials
#ENV GOOGLE_APPLICATION_CREDENTIALS gcs.json

# Expose the port on which the Flask server will run
EXPOSE 8080

# Run the Flask application
CMD ["python", "app.py"]