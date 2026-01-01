/**
 * @file src/lib/api-handler.js
 * @description Global API Route Wrapper (Middleware)
 */

import { verifyToken } from '@/lib/auth';

export function createApiHandler(handler, options = {}) {
  const { allowedMethods = [], role = null } = options;

  return async (req, res) => {
    try {
      // 1. Method Validation
      if (allowedMethods.length > 0 && !allowedMethods.includes(req.method)) {
        res.setHeader('Allow', allowedMethods);
        return res.status(405).json({ 
          success: false, 
          error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } 
        });
      }

      // 2. Authentication & Authorization
      // If 'role' is passed (string or true), we must verify the token
      if (role) {
        let token = req.headers.authorization?.replace('Bearer ', '');
        
        // Check Cookies if header is missing
        if (!token) {
          token = req.cookies.auth_token;
        }
        
        if (!token) {
           return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
        }

        const decoded = await verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
        }

        // 3. Role Specific Check
        // If role is a specific string (e.g. 'SUPER_ADMIN'), enforce it. 
        // If role is just 'true', we skip this check (allowing any logged-in user).
        if (typeof role === 'string' && role !== decoded.role && decoded.role !== 'SUPER_ADMIN') {
           return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
        }
        
        // Attach user to request
        req.user = decoded;
      }

      // 4. Execute Handler
      await handler(req, res);

    } catch (err) {
      console.error(`[API Error] ${req.url}:`, err);
      const statusCode = err.name === 'ZodError' ? 400 : 500;
      const message = err.name === 'ZodError' ? 'Validation Failed' : 'Internal Server Error';

      return res.status(statusCode).json({
        success: false,
        error: {
          code: err.code || 'SERVER_ERROR',
          message: message,
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
      });
    }
  };
}