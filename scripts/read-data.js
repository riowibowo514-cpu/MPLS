const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function readData() {
  const { data, error } = await supabase
    .from('pengisian')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((row, i) => {
    console.log(`\n--- Data ke-${i + 1} ---`);
    console.log(JSON.stringify(row.metadata_values, null, 2));
  });
}

readData();
