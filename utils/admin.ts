// utils/admin.ts

import { supabase } from '../lib/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    is_approved: boolean;
    created_at: string;
    // Tambahkan field email jika diperlukan (perlu join dengan auth.users - RLS memungkinkan)
}

/**
 * Mengambil SEMUA profil pengguna (Hanya admin yang boleh memanggil ini).
 */
export async function fetchAllUsers(): Promise<UserProfile[]> {
    try {
        // Karena RLS kita hanya ada di profiles untuk 'own profile', 
        // kita perlu menggunakan Supabase Service Role (atau Edge Function)
        // untuk Admin/Full Access, tapi untuk sementara kita anggap Admin bisa select all
        // dengan asumsi RLS di profiles sudah di set untuk ADMIN. (Lupa di Step 3)
        // KITA AKAN MODIFIKASI: Admin bisa SELECT semua profile.

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch All Users Error:', error.message);
            return [];
        }
        return data as UserProfile[];

    } catch (err) {
        console.error('Fetch All Users Exception:', err);
        return [];
    }
}

/**
 * Update role dan is_approved pengguna.
 */
export async function updateUserApproval(userId: string, role: string, isApproved: boolean): Promise<PostgrestSingleResponse<any>> {
    return supabase
        .from('profiles')
        .update({ role: role, is_approved: isApproved })
        .eq('id', userId);
}