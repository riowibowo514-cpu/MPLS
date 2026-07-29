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
              <img src="/logo-bgtk.png" alt="Logo BGTK Sumbar" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>PORTAL EVALUASI BGTK SUMATERA BARAT</span>
            </Link>
            <HeaderActions />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
