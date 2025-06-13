import firebase_admin
from firebase_admin import firestore
import os

class FirestoreClient:
    _db_client = None

    @staticmethod
    def get_instance():
        if FirestoreClient._db_client is None:
            if not firebase_admin._apps:
                firebase_admin.initialize_app()
            FirestoreClient._db_client = firestore.client()
        return FirestoreClient._db_client