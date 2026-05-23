'use client';
import { useCartStore } from '@/stores/cart.store';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = 15.00;
  const subtotal = total();
  const grandTotal = subtotal + (subtotal > 0 ? shipping : 0);

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login?redirect=/carrito';
        return;
      }
      const orderRes = await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      const order = orderRes.data;
      const intentRes = await api.post(`/payments/intent/${order.id}`);
      clearCart();
      window.location.href = `/orden/${order.id}?success=true`;
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al procesar el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, marginBottom: '2rem' }}>
          Tu carrito
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white',
            borderRadius: 12, border: '1px solid var(--c-border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <p style={{ color: 'var(--c-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              Tu carrito esta vacio
            </p>
            <Link href="/productos" className="btn-primary">Ver productos</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            <div>
              {items.map(item => (
                <div key={item.productId} style={{ display: 'flex', gap: '1rem', padding: '1.25rem',
                  background: 'white', borderRadius: 12, border: '1px solid var(--c-border)',
                  marginBottom: '1rem', alignItems: 'center' }}>
                  <img src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'}
                    alt={item.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: 'var(--c-sand)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: '0.2rem' }}>
                      {item.vendorName}
                    </p>
                    <p style={{ fontWeight: 500, marginBottom: '0.4rem' }}>{item.nameEs || item.name}</p>
                    <p style={{ color: 'var(--c-palm)', fontWeight: 600 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--c-border)',
                        background: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 500 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--c-border)',
                        background: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--c-muted)', fontSize: '1.2rem', padding: '0.25rem' }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--c-border)',
              padding: '1.5rem', position: 'sticky', top: 80 }}>
              <h2 style={{ fontWeight: 600, marginBottom: '1.25rem', fontSize: '1.1rem' }}>Resumen del pedido</h2>

              <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '1rem' }}>
                {[
                  { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
                  { label: 'Envio estimado', value: subtotal > 0 ? `$${shipping.toFixed(2)}` : '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between',
                    marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--c-muted)' }}>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  borderTop: '1px solid var(--c-border)', paddingTop: '0.75rem',
                  fontWeight: 600, fontSize: '1.05rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--c-palm)' }}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fff0f0', color: '#c0392b', padding: '0.75rem',
                  borderRadius: 8, fontSize: '0.85rem', marginTop: '1rem', border: '1px solid #f5c6cb' }}>
                  {error}
                </div>
              )}

              <button onClick={handleCheckout} disabled={loading || items.length === 0}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center',
                  opacity: loading ? 0.7 : 1, fontSize: '0.95rem', padding: '0.8rem' }}>
                {loading ? 'Procesando...' : 'Confirmar pedido →'}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', textAlign: 'center',
                marginTop: '0.75rem', lineHeight: 1.4 }}>
                Pago seguro. El envio final se confirma con Dominican Shipping.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
