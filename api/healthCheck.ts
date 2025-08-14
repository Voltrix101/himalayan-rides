import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors, handleOptions, successResponse } from '../_lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  enableCors(res);
  if (handleOptions(req, res)) return;

  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      firebase: 'connected',
      razorpay: 'configured',
      email: 'configured'
    }
  });
}
