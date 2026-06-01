"""
Helper functions for Firebase Storage operations.
"""

import os
import json
import requests
from typing import Optional, Dict, Any

try:
    import pyrebase
    PYREBASE_AVAILABLE = True
except ImportError:
    PYREBASE_AVAILABLE = False


def get_firebase_config() -> Dict[str, str]:
    """
    Get Firebase configuration from environment variables.
    
    Returns:
        Dictionary with Firebase configuration
    """
    return {
        "apiKey": os.getenv("FIREBASE_apiKey", ""),
        "authDomain": os.getenv("FIREBASE_authDomain", ""),
        "projectId": os.getenv("FIREBASE_projectId", ""),
        "storageBucket": os.getenv("FIREBASE_storageBucket", ""),
        "messagingSenderId": os.getenv("FIREBASE_messagingSenderId", ""),
        "appId": os.getenv("FIREBASE_appId", ""),
        "databaseURL": ""
    }


def download_from_firebase(bucket: str, filename: str) -> Optional[Any]:
    """
    Download a JSON file from Firebase Storage.
    
    Args:
        bucket: Firebase Storage bucket name
        filename: Path to file in storage
        
    Returns:
        Parsed JSON data or None if error
    """
    url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{filename.replace('/', '%2F')}?alt=media"
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"⚠️ Error downloading {filename}: {e}")
    return None


def upload_to_firebase(storage, local_path: str, remote_path: str) -> Optional[str]:
    """
    Upload a file to Firebase Storage.
    
    Args:
        storage: Pyrebase storage instance
        local_path: Local file path
        remote_path: Remote path in storage
        
    Returns:
        Download URL or None if error
    """
    if not PYREBASE_AVAILABLE or not storage:
        print("⚠️ Pyrebase not available or storage not initialized")
        return None
    
    try:
        storage.child(remote_path).put(local_path)
        url = storage.child(remote_path).get_url(None)
        print(f"✅ Uploaded: {remote_path}")
        return url
    except Exception as e:
        print(f"❌ Error uploading {remote_path}: {e}")
        return None


def save_json_atomic(path: str, data: Any) -> None:
    """
    Save JSON data atomically to avoid corruption.
    
    Args:
        path: File path
        data: Data to save
    """
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def load_json(path: str, default: Any = None) -> Any:
    """
    Load JSON data from file.
    
    Args:
        path: File path
        default: Default value if file doesn't exist or error
        
    Returns:
        Parsed JSON data or default
    """
    if default is None:
        default = {}
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Could not read {path}: {e}")
            return default
    return default
