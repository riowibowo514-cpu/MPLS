"use client";

import { useState } from 'react';
import Link from 'next/link';

type School = {
  id: string;
  namaSekolah: string;
  jenjang: string;
  statusFinal: string;
};

export default function DashboardSchoolList({ data }: { data: Record<string, School[]> }) {
  const [expandedKabKota, setExpandedKabKota] = useState<string | null>(null);

  if (!data || Object.keys(data).length === 0) return null;

  const kabKotaList = Object.keys(data).sort();

  const toggleKabKota = (kabKota: string) => {
    if (expandedKabKota === kabKota) {
      setExpandedKabKota(null);
    } else {
      setExpandedKabKota(kabKota);
    }
  };

  const getBadgeClass = (status: string) => {
    if (status === 'SANGAT RAMAH') return 'badge-sangat-ramah';
    if (status === 'CUKUP RAMAH') return 'badge-cukup-ramah';
    if (status === 'KURANG') return 'badge-kurang';
    return 'badge-default';
  };

  return (
    <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', textAlign: 'center' }}>
        Daftar Keterwakilan Sekolah (Sampel) per Kabupaten / Kota
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {kabKotaList.map(kabKota => (
          <div 
            key={kabKota} 
            style={{ 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <button 
              onClick={() => toggleKabKota(kabKota)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: expandedKabKota === kabKota ? 'var(--bg-color)' : '#fff',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.2s ease'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--primary)' }}>
                {kabKota}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-default" style={{ fontSize: '0.75rem' }}>
                  {data[kabKota].length} Sekolah
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ 
                    transform: expandedKabKota === kabKota ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </button>
            
            {expandedKabKota === kabKota && (
              <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
                  {data[kabKota].map((school, i) => (
                    <Link 
                      href={`/${school.id}`}
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: '0.25rem', transition: 'color 0.2s ease' }}>
                          {school.namaSekolah}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Jenjang: {school.jenjang}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${getBadgeClass(school.statusFinal)}`}>
                          {school.statusFinal}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
