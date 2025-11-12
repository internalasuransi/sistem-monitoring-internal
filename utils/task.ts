// utils/task.ts
import { supabase } from '../lib/supabase';

// Hanya fungsi read/fetch untuk Task
export async function fetchTasks() {
  try {
    // RLS (Step 4) akan memfilter data ini secara OTOMATIS
    // Admin melihat SEMUA task, User melihat task yang ditugaskan/dibuat oleh mereka.
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles(full_name)'); // Join untuk menampilkan nama user

    if (error) {
      console.error('Fetch Tasks Error:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error('Fetch Tasks Exception:', err);
    return [];
  }
}