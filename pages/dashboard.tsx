// pages/dashboard.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { signOut } from '../utils/auth';
import { fetchLogData } from '../utils/monitoring'; 
import { fetchTasks } from '../utils/task'; 
import { fetchAllUsers } from '../utils/admin'; 

// ******************* Komponen Role-Specific (Admin & User) *******************

const AdminView: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    
    useEffect(() => {
        fetchTasks().then(setTasks);
    }, []);

    return (
        <div style={{ border: '2px solid green', padding: '15px', marginTop: '20px' }}>
            <h3>🛠️ Halaman Admin (Akses Penuh)</h3>
            <p>Admin dapat melihat dan mengelola **SEMUA** Tugas/Komando di sistem.</p>
            <h4>Daftar Tugas (Global): {tasks.length}</h4>
            <ul>
                {tasks.map(t => <li key={t.id}>[{t.status}] {t.title} (Dibuat: {t.created_by})</li>)}
            </ul>
        </div>
    );
};

const UserView: React.FC = () => {
    const [logData, setLogData] = useState<any[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

    useEffect(() => {
        fetchLogData().then(setLogData);
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

// --- Komponen Pesan Not Approved ---
const NotApprovedView: React.FC = () => (
    <div style={{ border: '2px solid orange', padding: '20px', textAlign: 'center' }}>
        <h2>⏳ Akses Dibatasi - Menunggu Approval Admin</h2>
        <p>Akun Anda telah berhasil terdaftar, tetapi akses ke fitur Monitoring dan Controlling ditangguhkan sampai disetujui oleh Admin internal.</p>
    </div>
);

// --- Komponen Lonceng Notifikasi (Hanya Admin) ---
const AdminNotification: React.FC = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const router = useRouter(); 

    const checkPending = async () => {
        const users = await fetchAllUsers();
        const pending = users.filter(u => u.role === 'user' && u.is_approved === false); 
        setPendingCount(pending.length);
    };

    useEffect(() => {
        checkPending();
        const interval = setInterval(checkPending, 30000); 
        return () => clearInterval(interval);
    }, []);

    if (pendingCount === 0) return null;

    return (
        <div style={{ marginLeft: '20px', position: 'relative' }}>
            <button 
                onClick={() => router.push('/admin/approval')} 
                style={{ 
                    background: 'red', color: 'white', border: 'none', padding: '8px 15px', 
                    borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
                }}
            >
                🔔 Notifikasi Approval ({pendingCount} Tertunda)
            </button>
        </div>
    );
}

// --- Komponen Utama DashboardPage (Perubahan Logic) ---
const DashboardPage = () => {
    const { user, role, isLoading, isApproved } = useAuth();
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false); // <--- BARU: Status Loading Tombol

    const handleSignOut = async () => {
        setIsSigningOut(true); // Set loading
        const { error } = await signOut();
        
        if (error) {
            console.error("Sign Out Failed:", error);
            setIsSigningOut(false);
            alert("Gagal keluar. Coba lagi!");
            return;
        }

        // Redirect segera, AuthContext akan menangani cleanup
        router.push('/'); 
    };

    // 1. Loading
    if (isLoading) return <div>Memuat data pengguna dan role...</div>;

    // 2. Not Logged In (Redirect)
    if (!user) { router.push('/'); return null; }

    // 3. Pengecekan Approval - Jika role bukan 'admin' DAN belum di-approve
    if (role !== 'admin' && isApproved === false) {
        return (
            <div style={{ padding: '20px' }}>
                <p>Halo, **{user.email}**! Role Anda: **{role?.toUpperCase()}**</p>
                <button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    style={{ background: 'red', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {isSigningOut ? 'Keluar...' : 'Keluar / Sign Out'}
                </button>
                <NotApprovedView /> 
            </div>
        );
    }
    
    // 4. Logged In & Approved/Admin, Tampilkan Dashboard
    return (
        <div style={{ padding: '20px' }}>
            <h1>Sistem Monitoring & Controlling Internal</h1>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <p>Halo, **{user.email}**! Role Anda: **{role?.toUpperCase()}**</p>
                {role === 'admin' && <AdminNotification />} 
            </div>
            <button 
                onClick={handleSignOut} 
                disabled={isSigningOut} // <--- Disable saat memproses
                style={{ background: 'red', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {isSigningOut ? 'Keluar...' : 'Keluar / Sign Out'}
            </button>

            <hr style={{ margin: '20px 0' }}/>

            {role === 'admin' && <AdminView />}
            {role === 'user' && <UserView />}
        </div>
    );
};

export default DashboardPage;