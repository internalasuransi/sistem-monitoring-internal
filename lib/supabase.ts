// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Ambil variabel lingkungan. Tanda '!' memberitahu TypeScript bahwa variabel ini pasti ada.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cek keamanan (opsional tapi baik)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Kunci Supabase hilang. Cek file .env.local atau Environment Variables di Vercel."
  );
}

// Inisialisasi Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);