// pages/_app.tsx

import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
// import '../styles/globals.css' // Jika Anda memiliki file styling global

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Membungkus seluruh aplikasi dengan AuthProvider
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;