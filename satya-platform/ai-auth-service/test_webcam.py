import cv2
import requests
import time
import numpy as np

# API Endpoint
API_URL = "http://127.0.0.1:8000/api/v1/auth/scan"

def run_smart_kiosk():
    """
    State 1: Look at Camera (Find Face + Eyes)
    State 2: Blink Challenge (Find Face + NO Eyes) -> Auto Capture
    """
    cap = cv2.VideoCapture(1) # Try 0 or 1 depending on your USB setup
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Error: Could not open webcam.")
            return

    # Load Classifiers
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    print("🔒 SATYA SECURE TERMINAL STARTED")
    
    # Logic State Variables
    frames_stable = 0
    REQUIRED_STABLE_FRAMES = 10  # Frames where face is clearly seen
    
    # This flag prevents sending multiple requests once verified
    request_sent = False 

    while True:
        ret, frame = cap.read()
        if not ret: break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 1. Detect Face
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(100, 100))
        
        status_text = "Looking for voter..."
        status_color = (0, 255, 255) # Yellow

        if len(faces) > 0 and not request_sent:
            # Get largest face
            (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
            
            # Draw Face Box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # 2. Detect Eyes in ROI
            roi_gray = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 10) # Strict detection
            
            # Draw Eye Boxes (Visual feedback)
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(frame, (x+ex, y+ey), (x+ex+ew, y+ey+eh), (255, 0, 0), 1)

            # --- LOGIC FLOW ---
            
            # PHASE A: Stability Check (Must see eyes first)
            if len(eyes) >= 1:
                frames_stable += 1
                status_text = f"Keep Steady... {frames_stable}/{REQUIRED_STABLE_FRAMES}"
                status_color = (0, 255, 255) # Yellow
            
            # PHASE B: The Challenge (Once stable, ask for blink)
            if frames_stable >= REQUIRED_STABLE_FRAMES:
                status_text = "⚡️ BLINK NOW TO LOGIN ⚡️"
                status_color = (0, 0, 255) # Red (Attention!)
                
                # If we suddenly LOSE the eyes but KEEP the face, that's a BLINK!
                if len(eyes) == 0:
                    status_text = "✅ BLINK DETECTED - VERIFYING..."
                    status_color = (0, 255, 0) # Green
                    
                    # --- TRIGGER API ---
                    print("✅ Blink detected! Auto-sending to API...")
                    request_sent = True # Lock loop to prevent spamming
                    
                    # Capture current frame (where eyes are closed)
                    _, img_encoded = cv2.imencode('.jpg', frame)
                    files = {'file': ('blink_capture.jpg', img_encoded.tobytes(), 'image/jpeg')}
                    
                    try:
                        # Show 'Processing' on UI while we wait
                        cv2.putText(frame, "Verifying with Blockchain...", (50, 200), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)
                        cv2.imshow('SATYA Voter Kiosk', frame)
                        cv2.waitKey(1) # Force UI update
                        
                        start_time = time.time()
                        response = requests.post(API_URL, files=files)
                        duration = time.time() - start_time
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get("status") == "success":
                                print(f"\n🎉 LOGIN SUCCESSFUL ({duration:.2f}s)")
                                print(f"🔒 Identity Hash: {data.get('voter_hash')}")
                                print("redirecting to ballot...")
                                time.sleep(2) # Show success before closing
                                break 
                            else:
                                print(f"❌ DENIED: {data.get('message')}")
                                request_sent = False # Reset to try again
                        else:
                            print("❌ Server Error")
                            request_sent = False
                            
                    except Exception as e:
                        print(f"Connection Error: {e}")
                        request_sent = False

        else:
            # Reset if face is lost
            if not request_sent:
                frames_stable = 0

        # UI Overlay
        cv2.putText(frame, status_text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)
        cv2.imshow('SATYA Voter Kiosk', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_smart_kiosk()