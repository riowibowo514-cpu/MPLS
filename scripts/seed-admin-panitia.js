require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedUsers() {
  // Check if admin exists
  const { data: adminData } = await supabase.from('users').select('*').eq('username', 'admin').single();
  if (!adminData) {
    await supabase.from('users').insert({
      id: 'd9b54c7a-e8d3-4f10-bcd1-457d2fd43309',
      username: 'admin',
      password_hash: 'D4t4BgtkSumbar',
      nama_lengkap: 'Super Admin',
      role: 'admin'
    });
    console.log('Seeded admin user');
  } else {
    console.log('Admin user already exists');
  }

  // Check if panitia exists
  const { data: panitiaData } = await supabase.from('users').select('*').eq('username', 'panitia').single();
  if (!panitiaData) {
    await supabase.from('users').insert({
      id: 'e10b5c7a-e8d3-4f10-bcd1-457d2fd43310',
      username: 'panitia',
      password_hash: 'BGTK2026',
      nama_lengkap: 'Akses Portal Panitia',
      role: 'panitia'
    });
    console.log('Seeded panitia user');
  } else {
    console.log('Panitia user already exists');
  }
}
seedUsers();
