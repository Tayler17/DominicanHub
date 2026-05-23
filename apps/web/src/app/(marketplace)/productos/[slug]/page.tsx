'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/cart.store';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const cartCount = useCartStore(s => s.count());

  useEffect(() => {
    api.get(`/products/${params.slug}`)
      .then(r => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      nameEs: product.nameEs,
      price: Number(product.price),
      quantity: qty,
      image: product.images?.[0]?.url,
      vendorName: product.vendor?.businessName,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center', color: 'var(--c-muted)' }}>
        Cargando producto...
      </div>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--c-muted)' }}>Producto no encontrado.</p>
        <Link href="/productos" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Ver productos
        </Link>
      </div>
    </>
  );

  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop';
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--c-muted)', display: 'flex', gap: '0.5rem' }}>
          <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Inicio</Link>
          <span>/</span>
          <Link href="/productos" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Productos</Link>
          <span>/</span>
          <span>{product.nameEs || product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Image */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--c-sand)' }}>
            <img src={image} alt={product.name}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
          </div>

          {/* Info */}
          <div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {product.category && (
                <span className="badge badge-green">{product.category.nameEs || product.category.name}</span>
              )}
              {product.originCountry && (
                <span className="badge" style={{ background: 'var(--c-gold-light)', color: '#92700a' }}>
                  Origen: {product.originCountry}
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400,
              lineHeight: 1.2, marginBottom: '0.5rem' }}>
              {product.nameEs || product.name}
            </h1>

            <Link href={`/vendedor/${product.vendor?.businessNameSlug}`}
              style={{ fontSize: '0.875rem', color: 'var(--c-palm)', textDecoration: 'none', fontWeight: 500 }}>
              {product.vendor?.businessName}
            </Link>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '1.25rem 0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--c-palm)' }}>
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span style={{ fontSize: '1.1rem', color: 'var(--c-muted)', textDecoration: 'line-through' }}>
                  ${Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
              {discount && (
                <span className="badge" style={{ background: '#fee', color: '#c0392b' }}>-{discount}%</span>
              )}
            </div>

            {product.description && (
              <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                {product.descriptionEs || product.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cantidad:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--c-border)',
                    background: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600, fontSize: '1.05rem' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--c-border)',
                    background: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem',
                fontSize: '1rem', background: added ? '#0f6e56' : undefined }}>
              {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
            </button>

            {cartCount > 0 && (
              <Link href="/carrito" className="btn-outline"
                style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', textDecoration: 'none' }}>
                Ver carrito ({cartCount})
              </Link>
            )}

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--c-palm-light)',
              borderRadius: 10, fontSize: '0.85rem', color: 'var(--c-palm-dark)' }}>
              <strong>Envio a Republica Dominicana</strong> via Dominican Shipping.
              Tiempo estimado: 7-15 dias habiles.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
