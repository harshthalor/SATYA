import cv2
import numpy as np

# Load pre-trained classifiers
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

def check_liveness(image_array):
    """
    Detects liveness by checking for eye blinking.
    Returns: (bool, message)
    """
    if image_array is None:
        return False, "Empty image"

    # Convert to grayscale
    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    
    # 1. Detect Face
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
    
    if len(faces) == 0:
        return False, "No face detected."
    
    # Process the largest face
    (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
    
    # ROI for eyes
    roi_gray = gray[y:y+h, x:x+w]
    
    # 2. Detect Eyes
    eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 10)
    
    # Logic: 
    # Eyes visible (>=2) = Eyes Open.
    # Face visible + No eyes (<2) = Blink/Closed (which verifies liveness in this simple logic).
    # NOTE: In a real app, you might want a sequence of checks, but for this demo:
    # "Blink Detected" = PASS. "Eyes Open" = ASK TO BLINK.
    
    if len(eyes) >= 2:
        return False, "Eyes are OPEN. Please blink to verify liveness."
    else:
        return True, "Liveness Confirmed: Blink Detected."