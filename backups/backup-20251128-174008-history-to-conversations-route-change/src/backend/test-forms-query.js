const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('\n=== Testing EXACT query from routes ===\n');

  const { data, error } = await supabase
    .from('forms')
    .select(`
      id, title, description, settings,
      is_active, is_published,
      total_responses, conversion_rate, average_lead_score,
      public_url, created_at, updated_at
    `)
    .eq('user_id', 'a367fa01-eff8-4a7b-a2b3-cb80ecc04432')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  console.log('Forms found:', data ? data.length : 0);
  console.log('Has error:', error ? true : false);

  if (error) {
    console.log('\nError details:',  JSON.stringify(error, null, 2));
  }

  if (data && data.length > 0) {
    console.log('\nFirst 3 forms:');
    data.slice(0, 3).forEach(f => {
      console.log(`  - ${f.title} (${f.id})`);
    });
  }
})();
