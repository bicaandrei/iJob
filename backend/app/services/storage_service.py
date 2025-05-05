from google.cloud import storage
from app.db.firebase_init import FIREBASE_KEY_PATH

def upload_to_google_storage(file_path: str, bucket_name: str, destination_blob_name: str):
    try:
        storage_client = storage.Client.from_service_account_json(FIREBASE_KEY_PATH)

        bucket = storage_client.bucket(bucket_name)

        if not bucket.exists():
            raise ValueError(f"Bucket '{bucket_name}' does not exist.")

        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(file_path)

        blob.make_public()

        print(f"File {file_path} uploaded to {destination_blob_name} in bucket {bucket_name}.")
        return blob.public_url
    except Exception as e:
        print(f"Error uploading file to Google Cloud Storage: {e}")
        raise