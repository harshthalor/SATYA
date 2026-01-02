import cv2
import hashlib
import json
import numpy as np

def generate_voter_hash(image_array):

    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (128, 128))
    gray = gray.astype(np.float32) / 255.0

    pixel_list = gray.flatten().tolist()

    pixel_str = json.dumps(pixel_list, sort_keys=True)
    secure_hash = hashlib.sha256(pixel_str.encode()).hexdigest()
    
    return secure_hash
