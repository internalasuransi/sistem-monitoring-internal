// utils/monitoring.ts
import { supabase } from '../lib/supabase';

// Hanya fungsi read/fetch untuk Log Data
export async function fetchLogData() {
  try {
    // RLS (Step 4) mengizinkan semua authenticated user untuk SELECT
    const { data, error } = await supabase
      .from('log_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50); // Ambil 50 data terbaru

    if (error) {
      console.error('Fetch Log Error:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error('Fetch Log Exception:', err);
    return [];
  }
}