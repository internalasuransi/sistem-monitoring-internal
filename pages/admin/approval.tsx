// pages/admin/approval.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Asumsi Anda menggunakan path alias @
import { useRouter } from 'next/router';
import { fetchAllUsers, updateUserApproval, UserProfile } from '@/utils/admin'; // Asumsi Anda menggunakan path alias @
// --- Komponen Form Detail Approval ---
const UserApprovalForm: React.FC<{ user: UserProfile, onAction: (isApprove: boolean, role: string) => void, onClose: () => void }> = ({ user, onAction, onClose }) => {
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (isApprove: boolean) => {
        setLoading(true);
        await onAction(isApprove, selectedRole);
        setLoading(false);
    };

    return (
        <div style={{ border: '2px solid #333', padding: '20px', marginTop: '20px', background: 'white', position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 10, maxWidth: '400px' }}>
            <h3>Aksi untuk {user.full_name || user.id.slice(0, 8)}...</h3>
            <p>Email (ID): {user.full_name || 'N/A'}</p>
            <p>Status: {user.is_approved ? 'DISETUJUI' : 'PENDING'}</p>
            
            <label style={{ display: 'block', margin: '10px 0' }}>
                Pilih Role:
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={loading} style={{ marginLeft: '10px', padding: '5px' }}>
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                </select>
            </label>
            <br/>
            
            <button 
                onClick={() => handleSubmit(true)} 
                disabled={loading}
                style={{ background: 'green', color: 'white', marginRight: '10px', padding: '10px' }}
            >
                {loading ? 'Memproses...' : user.is_approved ? 'Ubah Role' : 'SETUJUI & Set Role'}
            </button>
            
            {!user.is_approved && (
                <button 
                    onClick={() => handleSubmit(false)} 
                    disabled={loading}
                    style={{ background: 'red', color: 'white', padding: '10px' }}
                >
                    TOLAK Pendaftaran
                </button>
            )}
            
            <button onClick={onClose} disabled={loading} style={{ marginLeft: '10px', padding: '10px', background: '#ccc' }}>Tutup</button>
        </div>
    );
};


const ApprovalPage = () => {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // --- Logic Akses Halaman ---
    useEffect(() => {
        if (!isLoading && (!user || role !== 'admin')) {
            router.push('/'); // Redirect jika bukan Admin atau belum login
        } else if (user && role === 'admin') {
            loadUsers();
        }
    }, [user, role, isLoading, router]);
    
    // --- Logic Load Data ---
    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const allUsers = await fetchAllUsers();
            // Filter user yang role-nya bukan 'admin' (Admin tidak perlu di-approve oleh admin lain)
            setUsers(allUsers.filter(u => u.role !== 'admin')); 
        } catch (err) {
            setError("Gagal memuat data pengguna. Cek RLS Admin di profiles.");
        } finally {
            setLoading(false);
        }
    };
    
    // --- Logic Approval/Rejection ---
    const handleApprovalAction = async (isApprove: boolean, newRole: string) => {
        if (!selectedUser) return;

        try {
            const successText = isApprove ? 'DISETUJUI' : 'DITOLAK';
            await updateUserApproval(selectedUser.id, newRole, isApprove);
            
            alert(`Pengguna ${selectedUser.full_name || selectedUser.id.slice(0, 8)}... berhasil ${successText}. Role: ${newRole}.`);
            setSelectedUser(null);
            loadUsers(); // Refresh daftar pengguna
        } catch (err) {
            alert("Gagal memperbarui status pengguna. Cek kebijakan UPDATE RLS profiles.");
        }
    };

    if (isLoading || !user || role !== 'admin') {
        return <div>Memeriksa akses Admin...</div>;
    }

    const pendingUsers = users.filter(u => u.is_approved === false);

    return (
        <div style={{ padding: '20px' }}>
            <h2>🛠️ Admin Approval & Role Management</h2>
            <p>Total Pengguna (Non-Admin): {users.length}. Tertunda Approval: {pendingUsers.length}</p>
            <button onClick={() => router.push('/dashboard')}>← Kembali ke Dashboard</button>
            <hr style={{ margin: '20px 0' }}/>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {/* --- Tabel Daftar Pengguna --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nama / Email (ID)</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role Saat Ini</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status Approval</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan={4} style={{ textAlign: 'center' }}>Memuat data...</td></tr>}
                    {users.map((u) => (
                        <tr key={u.id} style={{ background: u.is_approved ? '#e6ffe6' : '#fff0f0' }}>
                            <td 
                                style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}
                            >
                                {u.full_name || 'N/A'} (ID: {u.id.slice(0, 4)}...)
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{u.role.toUpperCase()}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: u.is_approved ? 'green' : 'red' }}>
                                {u.is_approved ? 'DISETUJUI' : 'PENDING'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button onClick={() => setSelectedUser(u)} disabled={selectedUser?.id === u.id}>
                                    Atur
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* --- Modal/Form Approval Detail --- */}
            {selectedUser && (
                <UserApprovalForm 
                    user={selectedUser} 
                    onAction={handleApprovalAction} 
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default ApprovalPage;