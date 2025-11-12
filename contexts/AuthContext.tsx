// contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { fetchUserRole } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  role: string | null; // Role: 'admin' atau 'user'
  isLoading: boolean; // Status loading saat cek sesi awal
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fungsi untuk mendapatkan sesi & role saat aplikasi pertama kali dimuat
    const getInitialUser = async () => {
        const { data: { user: initialUser } } = await supabase.auth.getUser();
        setUser(initialUser);
        
        if (initialUser) {
            const { role: userRole } = await fetchUserRole(initialUser.id);
            setRole(userRole);
        }
        setIsLoading(false);
    };
    
    // Listener untuk mendengarkan perubahan state Auth (Sign In, Sign Out, Refresh Token, dll.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Panggil fungsi dari Step 5
          const { role: userRole } = await fetchUserRole(currentUser.id);
          setRole(userRole);
        } else {
          setRole(null); // Clear role on sign out
        }
        setIsLoading(false);
      }
    );
    
    getInitialUser(); // Jalankan cek awal
    
    // Cleanup function
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk akses Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};