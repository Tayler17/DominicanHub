'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      background: 'white', borderBottom: '1px solid var(--c-border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, background: 'var(--c-palm)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>D</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--c-ink)' }}>
            Dominican Hub
          </span>
        </Link>

        <div style={{ flex: 1, maxWidth: 420, margin: '0 2rem', position: 'relative' }}>
          <input type="text" placeholder="Buscar productos para la Republica Dominicana..."
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem',
              border: '1px solid var(--c-border)', borderRadius: 8, fontSize: '0.875rem',
              background: 'var(--c-sand)', outline: 'none', fontFamily: 'var(--font-body)' }}
          />
          <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, opacity: 0.5 }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/track" style={{ fontSize: '0.875rem', color: 'var(--c-muted)', textDecoration: 'none' }}>
            Rastrear envio
          </Link>
          <Link href="/login" className="btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Iniciar sesion
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  );
}
