import firebase_admin
from firebase_admin import credentials, firestore
import os

FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH", "firebase-key.json")

class FirestoreClient:

    _db_client = None

    @staticmethod
    def get_instance():
        if FirestoreClient._db_client is None:
            cred = credentials.Certificate(FIREBASE_KEY_PATH)
            firebase_admin.initialize_app(cred)
            FirestoreClient._db_client = firestore.client()
        return FirestoreClient._db_client