import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Or public anon key if verifying client-side tokens
const supabase = createClient(supabaseUrl, supabaseKey);

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify the token with Supabase
    // Note: For backend, you might want to use the service role key and admin.getUserById
    // or verify the token directly if it's a JWT issued by Supabase.
    // The current approach uses getUser which might require the public anon key
    // if the token is a client-side issued JWT.
    // For a more robust backend verification, consider:
    // const { data: { user }, error } = await supabase.auth.admin.getUserById(userIdFromToken);
    // For now, we'll stick to the client-side token verification as it's simpler for initial setup.
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Token is not valid', error: error?.message });
    }

    req.user = data.user; // Attach the user object to the request
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { protect };
