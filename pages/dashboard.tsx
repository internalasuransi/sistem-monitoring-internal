// pages/dashboard.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { signOut } from '../utils/auth';
import { fetchLogData } from '../utils/monitoring'; 
import { fetchTasks } from '../utils/task'; 

// ******************* Komponen Contoh Role-Specific *******************

const AdminView: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    
    useEffect(() => {
        // Sebagai Admin, fetchTasks akan mengembalikan SEMUA task
        fetchTasks().then(setTasks);
    }, []);

    return (
        <div style={{ border: '2px solid green', padding: '15px', marginTop: '20px' }}>
            <h3>🛠️ Halaman Admin (Akses Penuh)</h3>
            <p>Admin dapat melihat dan mengelola **SEMUA** Tugas/Komando di sistem.</p>
            <h4>Daftar Tugas (Global): {tasks.length}</h4>
            <ul>
                {tasks.map(t => <li key={t.id}>[{t.status}] {t.title} (Oleh: {t.profiles?.full_name || 'N/A'})</li>)}
            </ul>
        </div>
    );
};

const UserView: React.FC = () => {
    const [logData, setLogData] = useState<any[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

    useEffect(() => {
        fetchLogData().then(setLogData);
        // Sebagai User, fetchTasks akan difilter oleh RLS untuk hanya tugas yang relevan
        fetchTasks().then(setAssignedTasks); 
    }, []);

    return (
        <div style={{ border: '2px solid blue', padding: '15px', marginTop: '20px' }}>
            <h3>👤 Halaman User (Akses Terbatas)</h3>
            <p>User hanya dapat melihat Log Data dan Tasks yang ditugaskan kepada mereka.</p>
            
            <h4>Log Data Terbaru ({logData.length} baris)</h4>
            <ul>
                {logData.slice(0, 5).map(log => <li key={log.id}>[{new Date(log.timestamp).toLocaleTimeString()}] {log.sensor_name}: {log.value}</li>)}
            </ul>
            
            <h4>Tasks Ditugaskan Kepada Anda ({assignedTasks.length} tugas)</h4>
            <ul>
                {assignedTasks.map(t => <li key={t.id}>[{t.status}] {t.title}</li>)}
            </ul>
        </div>
    );
};


// ******************* Komponen Utama Dashboard *******************

const DashboardPage = () => {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/'); // Redirect ke halaman login setelah Sign Out
    };

    // 1. Loading
    if (isLoading) {
        return <div>Memuat data pengguna dan role...</div>;
    }

    // 2. Not Logged In (Redirect)
    if (!user) {
        router.push('/'); 
        return null; 
    }

    // 3. Logged In, Tampilkan Dashboard berdasarkan Role
    return (
        <div style={{ padding: '20px' }}>
            <h1>Sistem Monitoring & Controlling Internal</h1>
            <p>Selamat datang, **{user.email}**! Role Anda: **{role?.toUpperCase() ?? 'Loading Role...'}**</p>
            <button onClick={handleSignOut} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Keluar / Sign Out
            </button>

            <hr style={{ margin: '20px 0' }}/>

            {role === 'admin' && <AdminView />}
            {role === 'user' && <UserView />}
            {(role !== 'admin' && role !== 'user') && <p>Role tidak terdeteksi atau tidak valid. Harap hubungi Admin.</p>}
        </div>
    );
};

export default DashboardPage;