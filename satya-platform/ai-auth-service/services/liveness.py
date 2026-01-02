import cv2
import numpy as np

# Load pre-trained classifiers (built into OpenCV)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

def check_liveness(image_array):
    """
    detects liveness by checking for eye presence.
    Logic: 
    - Face found + Eyes found = Eyes Open (State A)
    - Face found + No Eyes found = Eyes Closed/Blink (State B)
    """
    if image_array is None:
        return False, "Empty image"

    # Convert to grayscale (required for Haar Cascades)
    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    
    # 1. Detect Face
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
    
    if len(faces) == 0:
        return False, "No face detected."
    
    # Process the largest face found
    (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
    
    # Extract the "Region of Interest" (ROI) for the face area
    roi_gray = gray[y:y+h, x:x+w]
    
    # 2. Detect Eyes within the face ROI
    # scaling factor 1.1, minNeighbors 10 (high threshold to avoid false positives)
    eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 10)
    
    # LOGIC:
    # If we see eyes -> User is staring (PASSIVE)
    # If we see face but NO eyes -> User is blinking (ACTIVE LIVENESS)
    
    if len(eyes) >= 2:
        return False, "Eyes are OPEN. Please blink to verify liveness."
    else:
        # We found a face, but zero (or only 1) eye. 
        # This implies a blink or eyes closed.
        return True, "Liveness Confirmed: Blink Detected."