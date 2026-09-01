"use client";

import { useState, useEffect } from 'react';

type User = {
  id: string;
  username: string;
  nama_lengkap: string;
  role: string;
  created_at: string;
};

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk form ganti password
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat pengguna');
      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    if (!confirm(`Yakin ingin mereset password untuk user ${selectedUser.username}?`)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password');
      
      alert('Password berhasil direset!');
      setSelectedUser(null);
      setNewPassword('');
      setShowNewPassword(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Kelola Pengguna</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Daftar akun dan pengaturan akses</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Memuat data pengguna...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map(user => (
            <div key={user.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.nama_lengkap} 
                  <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem' }}>{user.role}</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Username: <strong>{user.username}</strong></p>
              </div>
              <div>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setSelectedUser(user)}
                  style={{ fontSize: '0.875rem' }}
                >
                  Reset Password
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reset Password */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Reset Password</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Setel ulang password untuk akun <strong>{selectedUser.username}</strong> ({selectedUser.nama_lengkap}).
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Password Baru</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ketik password baru..."
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '0.75rem', 
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                    title={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setSelectedUser(null);
                    setShowNewPassword(false);
                  }}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
