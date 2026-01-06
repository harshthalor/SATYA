import axios from 'axios';
import FormData from 'form-data';

const API_KEY = process.env.FACEPP_API_KEY;
const API_SECRET = process.env.FACEPP_API_SECRET;
const FACESET_OUTER_ID = process.env.FACEPP_FACESET_TOKEN || 'satya_voters_faceset';
const BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';

// Helper: Sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Basic Request (Throttled)
const makeRequest = async (endpoint: string, params: any) => {
    await sleep(1200); // 1.2s Throttle

    const form = new FormData();
    form.append('api_key', API_KEY);
    form.append('api_secret', API_SECRET);
    for (const key in params) {
        form.append(key, params[key]);
    }

    try {
        const response = await axios.post(`${BASE_URL}${endpoint}`, form, {
            headers: { ...form.getHeaders() }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error_message || error.message);
    }
};

/**
 * 1. INITIALIZE (Use outer_id)
 */
export const ensureFaceSetExists = async () => {
    try {
        console.log(`⚙️ Ensuring FaceSet '${FACESET_OUTER_ID}' exists...`);
        await makeRequest('/faceset/create', { 
            outer_id: FACESET_OUTER_ID, 
            display_name: 'Satya Voters'
        });
        console.log("✅ New FaceSet Created.");
        await sleep(2000); 
    } catch (error: any) {
        if (error.message.includes('FACESET_EXIST')) {
            console.log("✅ FaceSet already exists.");
            return;
        }
        console.warn("⚠️ FaceSet Init Warning:", error.message);
    }
};

/**
 * 2. NEW: LIVENESS CHECK (Quality Analysis)
 * Returns true if the image is high quality (likely real), false if suspicious.
 */
/**
 * 2. UPDATED: STRICTER LIVENESS CHECK
 * Checks Quality + Blur to detect screens.
 */
export const checkLiveness = async (base64Image: string): Promise<boolean> => {
    try {
        const res = await makeRequest('/detect', {
            image_base64: base64Image,
            return_attributes: 'facequality,blur' 
        });

        if (!res.faces || res.faces.length === 0) return false;

        const face = res.faces[0];
        const quality = face.attributes.facequality.value; // 0 to 100
        const blur = face.attributes.blur.blurness.value;  // 0 to 100 (Lower is clearer)

        console.log(`🔍 LIVENESS DEBUG -> Quality: ${quality} | Blur: ${blur}`);

        // 1. STRICTER QUALITY THRESHOLD
        // Real faces in good light are usually > 90. Phone screens are often 70-85.
        // Let's bump this to 80.0 or 85.0
        if (quality < 80.0) {
            console.warn("⚠️ Liveness Failed: Low Quality (Possible Screen)");
            return false;
        }

        // 2. BLUR CHECK
        // If the image is too blurry, it's likely a bad capture or a screen held badly.
        // Threshold: Reject if blur > 10.0 (adjust based on your camera)
        if (blur > 10.0) {
             console.warn("⚠️ Liveness Failed: Image too blurry");
             return false;
        }
        
        return true;
    } catch (error) {
        console.error("Liveness Check Failed (API Error):", error);
        return false; // Fail secure
    }
};
/**
 * 3. SEARCH FACE (Use outer_id)
 */
export const searchFace = async (base64Image: string) => {
    // Note: We do a basic detect here just to get the token for searching
    const detectRes = await makeRequest('/detect', { image_base64: base64Image });
    if (!detectRes.faces || detectRes.faces.length === 0) return null;
    
    const faceToken = detectRes.faces[0].face_token;

    try {
        const searchRes = await makeRequest('/search', {
            face_token: faceToken,
            outer_id: FACESET_OUTER_ID,
            return_result_count: 1
        });

        if (searchRes.results && searchRes.results.length > 0) {
            const match = searchRes.results[0];
            if (match.confidence > 80) {
                return { matchFound: true, faceToken: match.face_token, userId: match.user_id };
            }
        }
        return { matchFound: false, faceToken: faceToken };

    } catch (e: any) {
        if (e.message.includes('EMPTY_FACESET') || e.message.includes('INVALID_FACESET')) {
            return { matchFound: false, faceToken: faceToken };
        }
        throw e;
    }
};

/**
 * 4. ENROLL FACE (Use outer_id)
 */
export const enrollFace = async (faceToken: string, userId: string, retries = 3) => {
    try {
        console.log(`📝 Enrolling face into '${FACESET_OUTER_ID}'...`);
        
        await makeRequest('/faceset/addface', {
            outer_id: FACESET_OUTER_ID,
            face_tokens: faceToken
        });

        await makeRequest('/face/setuserid', {
            face_token: faceToken,
            user_id: userId
        });

    } catch (error: any) {
        if (error.message.includes('INVALID_FACESET') && retries > 0) {
            console.log("⏳ FaceSet syncing. Retrying...");
            await sleep(2000);
            return enrollFace(faceToken, userId, retries - 1);
        }
        throw error;
    }
};