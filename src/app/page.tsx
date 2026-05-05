import dynamic from 'next/dynamic';

const GameCanvas = dynamic(
  () => import('../components/GameCanvas').then((m) => m.GameCanvas),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GameCanvas />
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 14,
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <strong>3D Game Framework</strong>
        <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Next.js + Three.js</div>
      </div>
    </main>
  );
}
