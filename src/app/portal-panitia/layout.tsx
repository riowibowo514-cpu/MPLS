"use client";

import React, { useState, useEffect } from 'react';

export default function PortalPanitiaLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const auth = sessionStorage.getItem('panitia_pin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_PANITIA_PIN || 'BGTK2026';
    
    if (pin === correctPin) {
      sessionStorage.setItem('panitia_pin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('PIN tidak valid. Silakan coba lagi.');
      setPin('');
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
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN..."
                autoFocus
                style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '0.2em',
                  padding: '0.75rem'
                }}
                required
              />
              {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b' }}>
              Buka Kunci Akses
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Kembali ke Halaman Utama
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
