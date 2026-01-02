from fastapi import FastAPI, File, UploadFile
import numpy as np
import cv2
from services.liveness import check_liveness
from services.encoder import generate_voter_hash

app = FastAPI()

@app.post("/api/v1/auth/scan")
async def scan_face(file: UploadFile = File(...)):
    # read the image file
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    # check if the image is a live face
    result, message = check_liveness(image)
    if not result:
        return {"status": "error", "message": message}
    # generate the voter hash
    voter_hash = generate_voter_hash(image)
    if not voter_hash:
        return {"status": "error", "message": "Failed to generate voter hash"}
    # return the result
    return {"status": "success", "message": message, "voter_hash": voter_hash}
