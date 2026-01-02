# Installation Notes

## ✅ Successfully Installed

### Node.js Projects
1. **client-voter** - All npm packages installed (395 packages)
2. **client-admin** - All npm packages installed (1308 packages, used --legacy-peer-deps for TypeScript compatibility)
3. **server-core** - All npm packages installed (197 packages)

### Python Project
4. **ai-auth-service** - Core packages installed:
   - ✅ FastAPI
   - ✅ Uvicorn
   - ✅ OpenCV (python & contrib)
   - ✅ NumPy
   - ✅ Pillow
   - ✅ Pydantic
   - ✅ Python-JOSE
   - ✅ Passlib

## ⚠️ Known Issues

### asyncpg (PostgreSQL async driver)
- **Status**: Not installed due to Python 3.13 compatibility issues
- **Issue**: asyncpg 0.29.0 doesn't have pre-built wheels for Python 3.13 and building from source fails
- **Workaround Options**:
  1. Use Python 3.11 or 3.12 for ai-auth-service
  2. Wait for asyncpg to release Python 3.13 compatible version
  3. Use alternative: `psycopg2-binary` or `psycopg` (sync driver) temporarily

### TensorFlow
- **Status**: Not installed (commented out in requirements.txt)
- **Issue**: TensorFlow 2.13.0 doesn't support Python 3.13
- **Recommendation**: Use Python 3.11 for TensorFlow/FaceNet model support

## Recommendations

For full compatibility, consider using Python 3.11 or 3.12 for the `ai-auth-service`:

```bash
# Using pyenv (if installed)
pyenv install 3.11.9
pyenv local 3.11.9  # in ai-auth-service directory
pip install -r requirements.txt
```

## Next Steps

1. For development without asyncpg: The service can run but database operations will fail
2. For production: Set up Python 3.11/3.12 environment for ai-auth-service
3. TensorFlow models: Install when ready to use FaceNet models (requires Python 3.11)


