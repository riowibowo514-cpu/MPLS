"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UbahPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Password konfirmasi tidak cocok.');
    }
    if (password.length < 6) {
      return setError('Password minimal 6 karakter.');
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah password');

      // Sukses
      alert('Password berhasil diubah! Mengarahkan ke Dashboard...');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container animate-fade-in" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', borderTop: '4px solid #f59e0b' }}>
        <h1 style={{ marginBottom: '1rem', color: '#f59e0b' }}>Keamanan Akun</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Anda login menggunakan password default. Demi keamanan, Anda <strong>wajib</strong> mengganti password sebelum mengakses Dashboard Analitik.
        </p>

        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Password Baru</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password baru..."
            />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Konfirmasi Password Baru</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru..."
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan ke Dashboard'}
            </button>
          </div>
        </form>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'gray', textAlign: 'center' }}>
          *Pastikan Anda mengingat password baru ini atau membagikannya kepada kolega Pimpinan lainnya jika akun ini digunakan bersama.
        </p>
      </div>
    </main>
  );
}
