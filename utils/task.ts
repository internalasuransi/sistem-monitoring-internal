// utils/task.ts

import { supabase } from '../lib/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Tipe data untuk Task
interface Task {
  title: string;
  description: string;
  assigned_to: string; // uuid user
  priority: 'low' | 'medium' | 'high';
  status?: 'open' | 'in_progress' | 'completed';
}

/**
 * Mengambil semua Task yang diizinkan oleh RLS.
 */
export async function fetchTasks() {
  try {
    // RLS (Step 4) akan memfilter data ini secara OTOMATIS
    const { data, error } = await supabase
      .from('tasks')
      // HANYA SELECT SEMUA FIELD DARI TASKS (menghilangkan JOIN yang bermasalah)
      .select('*') 
      .order('created_at', { ascending: false });

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

/**
 * Membuat Task Baru (Hanya Admin yang memiliki akses RLS untuk membuat)
 */
export async function createTask(task: Task): Promise<PostgrestSingleResponse<any>> {
    return supabase
        .from('tasks')
        .insert([task])
        .select();
}

/**
 * Fungsi dummy untuk operasi UPDATE (perlu diisi nanti)
 */
export async function updateTaskStatus(taskId: number, newStatus: string): Promise<PostgrestSingleResponse<any>> {
    return supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select();
}