import { supabaseServer } from '../config/supabase-auth.js';

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    console.log('[AUTH] 🔍 Authenticating request to:', req.path);

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('[AUTH] Has authorization header:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[AUTH] ❌ No authorization header found');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is invalid or missing'
      });
    }

    const token = authHeader.substring(7);
    console.log('[AUTH] Token extracted, length:', token.length);
    console.log('[AUTH] Token preview:', token.substring(0, 20) + '...');

    // Check if supabaseServer is available
    if (!supabaseServer) {
      console.error('[AUTH] ❌ CRITICAL: supabaseServer is null! Service role key not configured!');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Authentication service not properly configured'
      });
    }
    console.log('[AUTH] ✅ supabaseServer exists');

    // Verify user using supabase server client with the access token
    // The supabase server client can verify access tokens with the service role key
    console.log('[AUTH] 📡 Calling supabaseServer.auth.getUser()...');
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);

    console.log('[AUTH] Response:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!error,
      errorMessage: error?.message,
      errorStatus: error?.status
    });

    if (error || !user) {
      console.error('[AUTH] ❌ Authentication failed!');
      console.error('[AUTH] Error:', error?.message || 'No user found');
      console.error('[AUTH] Error details:', JSON.stringify(error, null, 2));
      console.error('[AUTH] Token (first 20 chars):', token?.substring(0, 20));

      // When using service role key, we can verify access tokens directly
      // If the token is invalid/expired, getUser will return an error
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is invalid or expired'
      });
    }

    console.log('[AUTH] ✅ User authenticated:', user.id);

    // Verify that the user object has the necessary fields
    if (!user.id) {
      console.error('Invalid user object: missing ID after successful authentication');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user data'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'USER'
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Provide a more general error response to avoid exposing internal details
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed'
    });
  }
};

// Optional authentication middleware (doesn't fail if no auth)
const optionalAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);

    // Get user using supabase server client (service role)
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (!error && user) {
      // User authenticated, attach to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'USER'
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    console.warn('Optional auth failed:', error.message);
    next();
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = Array.isArray(roles) ? roles.map(r => r.toLowerCase()) : [roles.toLowerCase()];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

export { 
  authenticateUser, 
  optionalAuth, 
  requireRole 
};