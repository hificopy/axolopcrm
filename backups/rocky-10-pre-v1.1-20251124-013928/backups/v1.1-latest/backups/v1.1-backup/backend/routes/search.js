/**
 * Master Search API Routes
 * Unified search across all CRM entities
 */

import express from 'express';
import comprehensiveSearchService from '../services/comprehensive-search-service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/search
 * Search across all entities
 * Query params:
 *   - q: search query (required)
 *   - limit: results per category (optional, default: 8)
 *   - categories: comma-separated list of categories to search (optional, default: all)
 */
router.get('/', async (req, res) => {
  try {
    // Try to get user from auth, but allow search to work without auth for navigation
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const { data } = await import('@supabase/supabase-js').then(mod => {
          const supabase = mod.createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );
          return supabase.auth.getUser(token);
        });
        userId = data?.user?.id || null;
      } catch (authError) {
        console.log('Auth failed, continuing with navigation-only search');
      }
    }

    const { q, limit, categories } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : 8,
      categories: categories ? categories.split(',') : ['all'],
    };

    const results = await comprehensiveSearchService.search(userId, q, options);

    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions based on recent searches and popular items
 */
router.get('/suggestions', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // For now, return empty suggestions
    // You can implement recent searches and popular items later
    res.json({
      success: true,
      suggestions: [],
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions',
      error: error.message,
    });
  }
});

export default router;
