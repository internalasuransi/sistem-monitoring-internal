// utils/auth.ts (Hanya bagian fetchUserRole yang diubah/disajikan)

// ... (definisi AuthInput, signUp, signInWithEmail, signOut)

// FUNGSI PENGAMBILAN ROLE (KUNCI RBAC)
export async function fetchUserRole(userId: string): Promise<{ role: string | null; isApproved: boolean | null; error: string | null }> {
    try {
        const { data, error } = await supabase
            // Ambil role dan is_approved dari tabel profiles
            .from('profiles')
            .select('role, is_approved')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Fetch Role Error:', error.message);
            return { role: null, isApproved: null, error: 'Gagal mengambil role/status approval.' };
        }

        // Return kedua field
        return { role: data.role, isApproved: data.is_approved, error: null };
    } catch (err) {
        return { role: null, isApproved: null, error: 'Network error saat mengambil role/status.' };
    }
}