# AI Auth Service

Python/FastAPI service for Facial Recognition & Liveness Detection.

## Features
- Facial recognition for voter authentication
- Liveness detection to prevent spoofing
- Biometric verification
- Integration with voter database

## Tech Stack
- Python
- FastAPI
- OpenCV / Face recognition libraries
- TensorFlow/PyTorch (for ML models)

## Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

