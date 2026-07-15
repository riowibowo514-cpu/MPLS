"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
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
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Login Admin</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Masukkan password untuk mengakses halaman rekapitulasi data.
        </p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Masukkan password..."
              autoFocus
              style={{ width: '100%' }}
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '-1rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </main>
  );
}
