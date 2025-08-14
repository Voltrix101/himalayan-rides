import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'himalayan-rides-1e0ef',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'himalayan-rides-1e0ef.firebasestorage.app'
  });
}

export const db = admin.firestore();
export const storage = admin.storage();

/**
 * CORS helper for Vercel functions
 */
export function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptions(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    enableCors(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Error response helper
 */
export function errorResponse(res: VercelResponse, statusCode: number, message: string, error?: any) {
  console.error('API Error:', message, error);
  res.status(statusCode).json({
    error: message,
    details: error?.message || error
  });
}

/**
 * Success response helper
 */
export function successResponse(res: VercelResponse, data: any, statusCode: number = 200) {
  res.status(statusCode).json(data);
}
