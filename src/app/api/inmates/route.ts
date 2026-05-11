import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      inmate_number, 
      first_name, 
      last_name, 
      date_of_birth, 
      offense, 
      sentence_start_date, 
      sentence_end_date,
      cell_id,
      photo_url
    } = body;

    // 1. Create Supabase Auth User
    const email = `inmate_${inmate_number}@prison.local`;
    const password = `inmate_${inmate_number}`; // Default password pattern

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${first_name} ${last_name}`,
        role: 'inmate'
      }
    });

    if (authError) {
      console.error('Auth User Creation Error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 2. Insert into Inmates Table linked to Auth User
    const { data: inmate, error: inmateError } = await supabaseAdmin
      .from('inmates')
      .insert([
        {
          profile_id: authUser.user.id, // Linking to the Auth User/Profile
          inmate_number,
          first_name,
          last_name,
          date_of_birth,
          offense,
          sentence_start_date,
          sentence_end_date,
          cell_id: cell_id || null, // Handle optional cell
          photo_url,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (inmateError) {
      // Rollback: Delete the auth user if inmate creation fails to avoid orphans
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      console.error('Inmate DB Insert Error:', inmateError);
      return NextResponse.json({ error: inmateError.message }, { status: 400 });
    }

    // 3. Create initial Wallet (Optional, but good practice)
    const { error: walletError } = await supabaseAdmin
        .from('wallets')
        .insert([{ inmate_id: inmate.id, balance: 0.00 }]);

    if (walletError) {
        console.warn('Wallet creation failed (non-critical):', walletError);
    }

    return NextResponse.json({ 
      success: true, 
      inmate, 
      credentials: { email, password } 
    });

  } catch (error: any) {
    console.error('SERVER ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
