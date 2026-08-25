import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import HeaderActions from '@/components/HeaderActions';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = {
  title: "PERLU BGTK",
  description: "Portal Evaluasi Ruang Lingkup BGTK Provinsi Sumatera Barat",
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
              <img src="/logo-bgtk.png" alt="Logo BGTK Sumbar" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.2' }}>PERLU BGTK</span>
              </div>
            </Link>
            <HeaderActions />
          </div>
        </header>
        {children}
        <BackButton />
      </body>
    </html>
  );
}
