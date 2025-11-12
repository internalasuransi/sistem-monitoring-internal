// contexts/AuthContext.tsx (SKRIP LENGKAP)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { fetchUserRole } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isApproved: boolean | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fungsi utama untuk update state berdasarkan user saat ini
    const updateAuthState = async (currentUser: User | null) => {
        setUser(currentUser);

        if (currentUser) {
            const { role: userRole, isApproved: approvalStatus } = await fetchUserRole(currentUser.id);
            setRole(userRole);
            setIsApproved(approvalStatus);
        } else {
            setRole(null);
            setIsApproved(null);
        }
        setIsLoading(false);
    }
    
    // Logic untuk mendapatkan user saat load pertama
    const getInitialUser = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        await updateAuthState(user);
    }
    
    getInitialUser();

    // Listener untuk mendengarkan perubahan state Auth (Sign In, Sign Out, dll.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateAuthState(session?.user ?? null);
      }
    );

    // Cleanup function
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return ( 
    <AuthContext.Provider value={{ user, role, isLoading, isApproved }}> 
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