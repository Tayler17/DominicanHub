import Link from 'next/link';

interface Product {
  id: string;
  slug: string;
  name: string;
  nameEs?: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  vendor: { businessName: string; businessNameSlug: string };
  category?: { name: string; nameEs: string };
  originCountry?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <Link href={`/productos/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
          <img src={image} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {discount && (
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <span className="badge" style={{ background: '#d4372a', color: 'white', fontSize: '0.7rem' }}>
                -{discount}%
              </span>
            </div>
          )}
          {product.originCountry && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                {product.originCountry}
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '0.875rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>
            {product.vendor.businessName}
          </p>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--c-ink)',
            marginBottom: '0.5rem', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.nameEs || product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--c-palm)', fontSize: '1.05rem' }}>
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span style={{ fontSize: '0.8rem', color: 'var(--c-muted)', textDecoration: 'line-through' }}>
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
