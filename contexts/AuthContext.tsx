// contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { fetchUserRole } from '../utils/auth'; // fetchUserRole harus sudah diupdate di utils/auth.ts

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isApproved: boolean | null; // <-- BARU: Status Approval
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null); // <-- BARU
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fungsi untuk mendapatkan sesi & role saat startup/perubahan state
    const updateAuthState = async (currentUser: User | null) => {
        setUser(currentUser);

        if (currentUser) {
            // Panggil fungsi yang sudah diupdate (dari utils/auth.ts)
            const { role: userRole, isApproved: approvalStatus } = await fetchUserRole(currentUser.id);
            setRole(userRole);
            setIsApproved(approvalStatus); // <-- SET STATUS APPROVAL
        } else {
            setRole(null);
            setIsApproved(null); // <-- RESET STATUS
        }
        setIsLoading(false);
    }
    
    // Logic untuk mendapatkan user saat load pertama (untuk refresh page)
    const getInitialUser = async () => {
        setIsLoading(true);
        const { data: { user } }