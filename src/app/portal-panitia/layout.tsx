"use client";

import React, { useState, useEffect } from 'react';

export default function PortalPanitiaLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const auth = sessionStorage.getItem('panitia_pin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    try {
      const res = await fetch('/api/panitia/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        sessionStorage.setItem('panitia_pin_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'PIN tidak valid. Silakan coba lagi.');
        setPin('');
      }
    } catch (err) {
      setError('Koneksi bermasalah. Coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          <div style={{ width: '64px', height: '64px', background: '#fef3c7', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>Akses Terkunci</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Silakan masukkan PIN keamanan untuk mengakses Portal Panitia.
          </p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPin ? "text" : "password"} 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan PIN..."
                  autoFocus
                  style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.2em',
                    padding: '0.75rem',
                    paddingRight: '3rem'
                  }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
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
                  title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showPin ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}
            </div>
            
            <button type="submit" disabled={isVerifying} className="btn btn-primary" style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b', opacity: isVerifying ? 0.7 : 1 }}>
              {isVerifying ? 'Memverifikasi...' : 'Buka Kunci Akses'}
            </button>
          </form>
          

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
