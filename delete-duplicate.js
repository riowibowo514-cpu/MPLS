const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const oldId = 'd2b89d4f-5035-416d-9dc8-4a360fad61bf';
  const { data, error } = await supabase.from('kegiatan').delete().eq('id', oldId);
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully deleted the old duplicate kegiatan:", oldId);
  }
}
run();
