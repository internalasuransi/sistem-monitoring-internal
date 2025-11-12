// utils/auth.ts

import { supabase } from '../lib/supabase';
import { AuthError, User } from '@supabase/supabase-js';

// Tipe Data untuk input otentikasi
interface AuthInput {
  email: string;
  password: string;
}

// --------------------------------------------------
// 1. FUNGSI SIGN UP
// --------------------------------------------------
export async function signUp({ email, password }: AuthInput): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { user: null, error };
    return { user: data.user, error: null };
  } catch (err) {
    console.error('Sign Up Exception:', err);
    return { user: null, error: { name: 'NetworkError', message: 'Koneksi gagal. Periksa jaringan Anda.', status: 500 } as AuthError };
  }
}

// --------------------------------------------------
// 2. FUNGSI SIGN IN
// --------------------------------------------------
export async function signInWithEmail({ email, password }: AuthInput): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error };
    return { user: data.user, error: null };
  } catch (err) {
    console.error('Sign In Exception:', err);
    return { user: null, error: { name: 'NetworkError', message: 'Koneksi gagal. Periksa jaringan Anda.', status: 500 } as AuthError };
  }
}

// --------------------------------------------------
// 3. FUNGSI SIGN OUT
// --------------------------------------------------
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('Sign Out Exception:', err);
    return { error: { name: 'NetworkError', message: 'Koneksi gagal. Periksa jaringan Anda.', status: 500 } as AuthError };
  }
}

// --------------------------------------------------
// 4. FUNGSI PENGAMBILAN ROLE (KUNCI RBAC)
// --------------------------------------------------
/**
 * Mengambil role pengguna dari tabel profiles berdasarkan ID pengguna.
 */
export async function fetchUserRole(userId: string): Promise<{ role: string | null; error: string | null }> {
  try {
    // Supabase Client akan otomatis menggunakan JWT user yang sedang aktif.
    // RLS (Step 3) memastikan user hanya bisa mengambil baris profil mereka sendiri.
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Fetch Role Error:', error.message);
      // Jika RLS bermasalah (misalnya tidak ada kebijakan SELECT), data akan kosong.
      return { role: null, error: 'Gagal mengambil role (Error RLS atau data hilang).' };
    }

    return { role: data.role, error: null };
  } catch (err) {
    return { role: null, error: 'Network error saat mengambil role.' };
  }
}