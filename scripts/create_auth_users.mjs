import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'Password123!';

async function run() {
  console.log("Starting Auth User Generation...");

  // 1. Process Staff
  const { data: staff, error: staffError } = await supabase.from('staff').select('*');
  if (staffError) {
    console.error("Error fetching staff:", staffError);
    return;
  }

  for (const person of staff) {
    if (person.profile_id) {
      console.log(`Staff ${person.first_name} ${person.last_name} already has an auth profile.`);
      continue;
    }

    const email = `${person.first_name.toLowerCase()}.${person.last_name.toLowerCase()}@sentinell.app`;
    console.log(`Creating auth user for Staff: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: person.first_name, last_name: person.last_name, role: person.role }
    });

    if (authError) {
      console.error(`Error creating auth user for ${email}:`, authError.message);
      continue;
    }

    const { error: updateError } = await supabase
      .from('staff')
      .update({ profile_id: authData.user.id })
      .eq('id', person.id);

    if (updateError) {
      console.error(`Error updating staff profile_id:`, updateError.message);
    } else {
      console.log(`Successfully linked Staff ${email}`);
    }
  }

  // 2. Process Inmates
  const { data: inmates, error: inmatesError } = await supabase.from('inmates').select('*');
  if (inmatesError) {
    console.error("Error fetching inmates:", inmatesError);
    return;
  }

  for (const person of inmates) {
    if (person.profile_id) {
      console.log(`Inmate ${person.inmate_number} already has an auth profile.`);
      continue;
    }

    const email = `${person.inmate_number}@sentinell.inmate`;
    console.log(`Creating auth user for Inmate: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: person.first_name, last_name: person.last_name, role: 'inmate' }
    });

    if (authError) {
      console.error(`Error creating auth user for ${email}:`, authError.message);
      continue;
    }

    const { error: updateError } = await supabase
      .from('inmates')
      .update({ profile_id: authData.user.id })
      .eq('id', person.id);

    if (updateError) {
      console.error(`Error updating inmate profile_id:`, updateError.message);
    } else {
      console.log(`Successfully linked Inmate ${email}`);
    }
  }

  console.log("Done generating auth users.");
}

run();
