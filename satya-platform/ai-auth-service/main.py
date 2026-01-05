from fastapi import FastAPI, File, UploadFile, HTTPException
import numpy as np
import cv2
import face_recognition
import psycopg2
import json
import os
import hashlib
from dotenv import load_dotenv
from services.liveness import check_liveness

# Load environment variables
load_dotenv()

app = FastAPI()

# 🛑 CONFIG: Connect to your Supabase Database (Session Pooler / Port 5432)
# Make sure this matches your Node.js .env string exactly
DB_DSN = os.getenv("DATABASE_URL", "postgresql://postgres.wlyzqqsnbqyhrxuaxeav:SatyaSuccess2026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")

def get_db_connection():
    try:
        return psycopg2.connect(DB_DSN)
    except Exception as e:
        print(f"❌ DB Connection Failed: {e}")
        return None

@app.post("/api/v1/auth/scan")
async def scan_face(file: UploadFile = File(...)):
    """
    REGISTRATION ENDPOINT:
    1. Checks Liveness.
    2. Generates Face Vector.
    3. Checks DB for duplicates (Duplicate Face Prevention).
    4. Returns Vector + Hash to Node.js for saving.
    """
    # 1. Read Image
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    # 2. Check Liveness (Optional: You can disable this for easier testing if needed)
    is_live, message = check_liveness(image)
    if not is_live:
        return {"status": "error", "message": message}

    # 3. Generate Face Encoding (Vector)
    # Convert BGR (OpenCV) to RGB (face_recognition)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_image)

    if len(encodings) == 0:
        return {"status": "error", "message": "No face detected. Please look clearly at the camera."}
    
    new_encoding = encodings[0]

    # 4. 🛑 DUPLICATE CHECK: Compare against ALL users in DB 🛑
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # Fetch only users who have a face descriptor saved
            cursor.execute("SELECT full_name, face_descriptor FROM voters WHERE face_descriptor IS NOT NULL")
            rows = cursor.fetchall()
            
            for name, saved_json in rows:
                # Convert stored JSON list back to numpy array
                saved_encoding = np.array(saved_json)
                
                # Check for match (tolerance 0.5 is strict, 0.6 is standard)
                match = face_recognition.compare_faces([saved_encoding], new_encoding, tolerance=0.5)
                
                if match[0]:
                    # ⛔ DUPLICATE FOUND
                    raise HTTPException(status_code=409, detail=f"Face match found! You are already registered as {name}.")
        finally:
            conn.close()

    # 5. Success: Generate a display hash and return the vector
    # We create a simple hash string just for the blockchain metadata
    secure_hash = hashlib.sha256(new_encoding.tobytes()).hexdigest()

    return {
        "status": "success", 
        "message": "Face is unique and live.",
        "voter_hash": secure_hash,          # For Blockchain ID
        "face_vector": new_encoding.tolist() # The vector to save in Postgres
    }

@app.post("/api/v1/auth/login")
async def login_face(file: UploadFile = File(...)):
    """
    LOGIN ENDPOINT:
    1. Scans face.
    2. Searches DB for a match.
    3. Returns the EPIC ID for login.
    """
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_image)

    if len(encodings) == 0:
        return {"status": "error", "message": "No face detected."}
    
    login_encoding = encodings[0]

    # Search DB for this face
    conn = get_db_connection()
    if not conn:
         return {"status": "error", "message": "Database unavailable"}

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT epic_id, full_name, face_descriptor FROM voters WHERE face_descriptor IS NOT NULL")
        rows = cursor.fetchall()

        for epic_id, name, saved_json in rows:
            saved_encoding = np.array(saved_json)
            # Compare
            match = face_recognition.compare_faces([saved_encoding], login_encoding, tolerance=0.5)
            
            if match[0]:
                # ✅ MATCH FOUND
                return {
                    "status": "success",
                    "epic_id": epic_id,
                    "full_name": name
                }
        
        # If loop finishes with no match
        raise HTTPException(status_code=401, detail="Face not recognized. Please register first.")

    finally:
        conn.close()