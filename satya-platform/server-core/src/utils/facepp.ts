import axios from 'axios';
import FormData from 'form-data';

const API_KEY = process.env.FACEPP_API_KEY;
const API_SECRET = process.env.FACEPP_API_SECRET;
// We use this ID for everything. It is a user-defined ID.
const FACESET_OUTER_ID = process.env.FACEPP_FACESET_TOKEN || 'satya_voters_faceset';
const BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';

// Helper: Sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Basic Request (Throttled)
const makeRequest = async (endpoint: string, params: any) => {
    await sleep(1200); // 1.2s Throttle is usually enough

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
        
        // Try to create using OUTER_ID (Your custom name)
        await makeRequest('/faceset/create', { 
            outer_id: FACESET_OUTER_ID, 
            display_name: 'Satya Voters'
        });
        
        console.log("✅ New FaceSet Created.");
        await sleep(2000); // Short wait for propagation
    } catch (error: any) {
        // If it exists, we are good.
        if (error.message.includes('FACESET_EXIST')) {
            console.log("✅ FaceSet already exists.");
            return;
        }
        console.warn("⚠️ FaceSet Init Warning:", error.message);
    }
};

/**
 * 2. SEARCH FACE (Use outer_id)
 */
export const searchFace = async (base64Image: string) => {
    const detectRes = await makeRequest('/detect', { image_base64: base64Image });
    if (!detectRes.faces || detectRes.faces.length === 0) return null;
    
    const faceToken = detectRes.faces[0].face_token;

    try {
        const searchRes = await makeRequest('/search', {
            face_token: faceToken,
            outer_id: FACESET_OUTER_ID, // <--- CHANGED to outer_id
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
        // If empty or invalid, assume unique
        if (e.message.includes('EMPTY_FACESET') || e.message.includes('INVALID_FACESET')) {
            return { matchFound: false, faceToken: faceToken };
        }
        throw e;
    }
};

/**
 * 3. ENROLL FACE (Use outer_id)
 */
export const enrollFace = async (faceToken: string, userId: string, retries = 3) => {
    try {
        console.log(`📝 Enrolling face into '${FACESET_OUTER_ID}'...`);
        
        // Add Face using OUTER_ID
        await makeRequest('/faceset/addface', {
            outer_id: FACESET_OUTER_ID, // <--- CHANGED to outer_id
            face_tokens: faceToken
        });

        // Tag User ID
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