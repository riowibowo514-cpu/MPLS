import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import HeaderActions from '@/components/HeaderActions';

export const metadata: Metadata = {
  title: "Monev MPLS Ramah 2026",
  description: "Aplikasi Monitoring dan Evaluasi MPLS Ramah 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <header className="app-header">
          <div className="container" style={{ paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" className="app-logo" style={{ gap: '1rem' }}>
              <div style={{ width: '130px', height: '40px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <img src="/logo-bgtk.png" alt="Logo BGTK Sumbar" style={{ height: '120px', width: 'auto', maxWidth: 'none', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '1.25rem' }}>Monev MPLS 2026</span>
            </Link>
            <HeaderActions />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
