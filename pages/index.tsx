// pages/index.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { signInWithEmail, signUp } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); // Toggle antara Sign In dan Sign Up
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect jika user sudah login
  useEffect(() => {
    if (user && !isLoading) {
      // Jika user sudah ada, arahkan ke halaman dashboard
      router.push('/dashboard'); 
    }
  }, [user, isLoading, router]);
  
  // Tampilkan loading saat AuthContext sedang inisialisasi sesi
  if (isLoading) {
    return <div>Memuat sesi otentikasi...</div>; 
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const authFunction = isSigningUp ? signUp : signInWithEmail;
    
    const { error: authError } = await authFunction({ email, password });
    
    if (authError) {
      // Tampilkan error dari Supabase (misalnya, 'Invalid login credentials')
      setError(authError.message); 
    } else {
      // Jika sukses, AuthContext listener akan mendeteksi dan trigger redirect di useEffect
    }
    setLoading(false);
  };

  if (user) return null; // Sembunyikan form saat user terotentikasi dan menunggu redirect

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #eee', borderRadius: '5px' }}>
      <h2>{isSigningUp ? 'Daftar Akun Internal' : 'Masuk Sistem Internal'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          disabled={loading}
          style={{ width: '100%', padding: '10px', margin: '8px 0', boxSizing: 'border-box' }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          disabled={loading}
          style={{ width: '100%', padding: '10px', margin: '8px 0', boxSizing: 'border-box' }}
        />
        
        {error && <p style={{ color: 'red', fontSize: '0.9em' }}>Error: {error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Memproses...' : isSigningUp ? 'DAFTAR' : 'MASUK'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }}/>
      <button 
        onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }} 
        disabled={loading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {isSigningUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
      </button>
      
      {/* Catatan: Fitur Forgot Password bisa ditambahkan kemudian menggunakan supabase.auth.resetPasswordForEmail */}
    </div>
  );
};

export default LoginPage;