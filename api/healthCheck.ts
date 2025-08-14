import { VercelRequest, VercelResponse } from '@vercel/node';
// Update the import path to the correct module or create the missing module if necessary
import { enableCors, handleOptions, successResponse } from '../_lib/utils';
// If '../_lib/utils' does not exist, create it and export the required functions.

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
