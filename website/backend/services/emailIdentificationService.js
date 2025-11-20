import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const identifyPotential = async (userId, subject, body) => {
  const text = `${subject || ''} ${body || ''}`.toLowerCase();
  const identified = {
    type: null,
    industry: null,
    descriptors: [],
  };

  // Fetch all identification keywords for the user or global ones
  const { data: keywords, error } = await supabase
    .from('identification_keywords')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`);

  if (error) {
    console.error('Error fetching identification keywords:', error);
    return null;
  }

  if (!keywords || keywords.length === 0) {
    return null; // No keywords to identify against
  }

  let highestMatchCount = 0;
  let bestMatch = null;

  for (const keywordEntry of keywords) {
    const { keyword, type, industry } = keywordEntry;
    const regex = new RegExp(`\b${keyword.toLowerCase()}\b`, 'g');
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
      if (!bestMatch || matches.length > highestMatchCount) {
        highestMatchCount = matches.length;
        bestMatch = { type, industry, descriptors: [keyword] };
      } else if (matches.length === highestMatchCount) {
        // If same match count, add descriptor to existing best match
        bestMatch.descriptors.push(keyword);
      }
    }
  }

  if (bestMatch) {
    identified.type = bestMatch.type;
    identified.industry = bestMatch.industry;
    identified.descriptors = [...new Set(bestMatch.descriptors)]; // Remove duplicates
    return identified;
  }

  return null;
};

export { identifyPotential };
