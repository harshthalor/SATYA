# FastAPI entry point

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from processor.face_processor import FaceProcessor
from processor.liveness_detector import LivenessDetector
from db_bridge import DBBridge

app = FastAPI(title="AI Auth Service", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
face_processor = FaceProcessor()
liveness_detector = LivenessDetector()
db_bridge = DBBridge()

@app.get("/")
async def root():
    return {"message": "AI Auth Service - Facial Recognition & Liveness Detection"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/verify-face")
async def verify_face(file: UploadFile = File(...)):
    """
    Verify facial recognition and liveness detection
    """
    try:
        # Read image file
        image_data = await file.read()
        
        # Check liveness
        is_live = await liveness_detector.detect(image_data)
        if not is_live:
            raise HTTPException(status_code=400, detail="Liveness detection failed")
        
        # Process face and generate hash
        face_hash = await face_processor.process_face(image_data)
        
        # Query database for matching face
        voter_id = await db_bridge.find_voter_by_face_hash(face_hash)
        
        if voter_id:
            return {
                "status": "verified",
                "voter_id": voter_id,
                "face_hash": face_hash
            }
        else:
            return {
                "status": "not_found",
                "message": "Face not registered in database"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register-face")
async def register_face(file: UploadFile = File(...), voter_id: str = None):
    """
    Register a new face for a voter
    """
    try:
        image_data = await file.read()
        
        # Check liveness
        is_live = await liveness_detector.detect(image_data)
        if not is_live:
            raise HTTPException(status_code=400, detail="Liveness detection failed")
        
        # Process face and generate hash
        face_hash = await face_processor.process_face(image_data)
        
        # Store in database
        await db_bridge.store_face_hash(voter_id, face_hash)
        
        return {
            "status": "registered",
            "voter_id": voter_id,
            "face_hash": face_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

