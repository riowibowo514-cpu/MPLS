"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const expectedRole = urlParams.get('role');
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, expectedRole })
      });

      if (res.ok) {
        const data = await res.json();
        // Gunakan window.location.href agar middleware dapat membaca cookie baru dengan sempurna
        window.location.href = data.redirect || '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan saat login.');
      }
    } catch (err) {
      setError('Koneksi bermasalah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container animate-fade-in" style={{ maxWidth: '400px', marginTop: '6rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Login Portal Monev</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Silakan masuk menggunakan kredensial {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('role') ? new URLSearchParams(window.location.search).get('role') : 'Anda'}.
        </p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username / NIP</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Masukkan username..."
              autoFocus
              style={{ width: '100%' }}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Masukkan password..."
                style={{ width: '100%', paddingRight: '2.5rem' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={() => router.push('/')} 
          className="btn btn-outline" 
          style={{ border: 'none' }}
        >
          &larr; Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}
