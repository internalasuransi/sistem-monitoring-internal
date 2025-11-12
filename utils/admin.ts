// utils/admin.ts

import { supabase } from '../lib/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Interface untuk data user dari tabel profiles
export interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    is_approved: boolean; // <--- Field kunci untuk approval
    created_at: string;
}

/**
 * Mengambil SEMUA profil pengguna. Hanya admin yang harus memanggil ini.
 * RLS (Step 58) harus mengizinkan Admin SELECT semua data profiles.
 */
export async function fetchAllUsers(): Promise<UserProfile[]> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch All Users Error:', error.message);
            // Error ini akan muncul jika user non-admin mencoba memanggil, atau jika ada masalah RLS
            return []; 
        }
        return data as UserProfile[];

    } catch (err) {
        console.error('Fetch All Users Exception:', err);
        return [];
    }
}

/**
 * Update role dan is_approved pengguna. Hanya Admin yang bisa (RLS Step 3/56)
 */
export async function updateUserApproval(userId: string, role: string, isApproved: boolean): Promise<PostgrestSingleResponse<any>> {
    return supabase
        .from('profiles')
        // Update kolom role dan is_approved
        .update({ role: role, is_approved: isApproved })
        .eq('id', userId)
        .select(); 
}