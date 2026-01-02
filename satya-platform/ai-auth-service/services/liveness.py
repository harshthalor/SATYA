import cv2

# Check if the image is a live face
def check_liveness(image_array): 
    # Convert to grayscale for face detection
    gray_frame = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    
    # Load the face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Detect faces
    frame_locations = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(frame_locations) == 0:
        return False, "No face found in the image"
    
    if len(frame_locations) > 1:
        return False, "Multiple faces found in the image"

    # In Phase 2, we will add 'Blink Detection' here.
    
    return True, "Face found in the image"
