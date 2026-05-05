import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3D Game Framework',
  description: 'A flexible 3D game framework built with Next.js, React, TypeScript, and Three.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000' }}>
        {children}
      </body>
    </html>
  );
}
