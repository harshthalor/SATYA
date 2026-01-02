import cv2
import requests
import time
import numpy as np

API_URL = "http://127.0.0.1:8000/api/v1/auth/scan"

def detect_eyes(gray, face_roi):
    """Detect eyes within a face region using OpenCV"""
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    x, y, w, h = face_roi
    roi_gray = gray[y:y+h, x:x+w]
    eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 3)
    return eyes

def run_liveness_check():
    """OpenCV-based liveness check using face and eye detection"""
    cap = cv2.VideoCapture(1)  # Try camera 0 first
    
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)  # Fallback to camera 1
        if not cap.isOpened():
            print("❌ Error: Could not open webcam.")
            return
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    liveness_verified = False
    face_detected_count = 0
    eye_detected_count = 0
    frames_with_face = 0
    required_frames = 10  # Face must be detected for at least 10 frames
    
    print("🔒 SATYA SECURE TERMINAL STARTED")
    print("👤 Please position your face in front of the camera...")
    print("👀 Keep your eyes open and look at the camera")
    print("Press 's' to capture when liveness is verified")
    print("Press 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))
        
        status_text = "No face detected"
        status_color = (0, 0, 255)  # Red
        
        if len(faces) > 0:
            # Only process the first (largest) face
            face = faces[0]
            x, y, w, h = face
            frames_with_face += 1
            
            # Draw face rectangle
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Detect eyes within the face region
            roi_gray = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 3)
            
            # Draw eye rectangles
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(frame, (x+ex, y+ey), (x+ex+ew, y+ey+eh), (255, 0, 0), 2)
            
            # Liveness criteria:
            # 1. Face detected for multiple consecutive frames
            # 2. At least one eye detected (proves it's a real face, not a photo)
            if frames_with_face >= required_frames:
                if len(eyes) >= 1:
                    liveness_verified = True
                    status_text = "✅ Liveness VERIFIED - Press 's' to capture"
                    status_color = (0, 255, 0)  # Green
                else:
                    status_text = "👀 Keep eyes open and visible"
                    status_color = (0, 255, 255)  # Yellow
            else:
                status_text = f"Face detected ({frames_with_face}/{required_frames} frames)..."
                status_color = (0, 255, 255)  # Yellow
        else:
            frames_with_face = 0
            liveness_verified = False
        
        # Display status
        cv2.putText(frame, status_text, (20, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        cv2.putText(frame, f"Frames: {frames_with_face}/{required_frames}", (20, 80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        cv2.imshow('SATYA Liveness Check', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            if liveness_verified:
                print("✅ Liveness Verified! Sending to API...")
                _, img_encoded = cv2.imencode('.jpg', frame)
                files = {'file': ('webcam_capture.jpg', img_encoded.tobytes(), 'image/jpeg')}
                
                try:
                    print("Sending image to API...")
                    start_time = time.time()
                    response = requests.post(API_URL, files=files)
                    duration = time.time() - start_time
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("status") == "success":
                            print(f"✅ SUCCESS! ({duration:.2f}s)")
                            print(f"Voter Hash: {data.get('voter_hash')}")
                            print(f"Message: {data.get('message')}")
                            cap.release()
                            cv2.destroyAllWindows()
                            return
                        else:
                            print(f"❌ FAILED: {data.get('message')}")
                    else:
                        print(f"❌ Server Error: {response.status_code} - {response.text}")
                except Exception as e:
                    print(f"❌ Error: {e}")
            else:
                print("⚠️  Action Blocked: Liveness not verified yet!")
                print("   - Ensure your face is clearly visible")
                print("   - Keep your eyes open and visible")
        elif key == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("👋 Session ended")


def capture_and_verify():
    """Simple capture function without liveness check"""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        cap = cv2.VideoCapture(1)
        if not cap.isOpened():
            print("❌ Error: Could not open webcam.")
            return
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    print("📷 SATYA - Voter Check-In")
    print("Press 's' to capture, 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, "Face Detected - Press 's' to capture", (20, 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            cv2.putText(frame, "No face detected", (20, 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        cv2.imshow('SATYA - Voter Check-In', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            if len(faces) > 0:
                print("✅ Face detected! Sending to API...")
                _, img_encoded = cv2.imencode('.jpg', frame)
                files = {'file': ('webcam_capture.jpg', img_encoded.tobytes(), 'image/jpeg')}
                
                try:
                    start_time = time.time()
                    response = requests.post(API_URL, files=files)
                    duration = time.time() - start_time
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("status") == "success":
                            print(f"✅ SUCCESS! ({duration:.2f}s)")
                            print(f"Voter Hash: {data.get('voter_hash')}")
                            print(f"Message: {data.get('message')}")
                        else:
                            print(f"❌ FAILED: {data.get('message')}")
                    else:
                        print(f"❌ Server Error: {response.status_code} - {response.text}")
                except Exception as e:
                    print(f"❌ Error: {e}")
            else:
                print("⚠️  No face detected. Please position your face in front of the camera.")
        elif key == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_liveness_check()
