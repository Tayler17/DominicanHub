import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

const API = 'http://localhost:3002/api/v1';

async function getProducts(search?: string, categoryId?: string) {
  try {
    const params = new URLSearchParams({ limit: '24' });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
    const res = await fetch(`${API}/products?${params}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], total: 0 };
    return res.json();
  } catch (e) {
    console.error('Products fetch error:', e);
    return { products: [], total: 0 };
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API}/products/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; categoria?: string };
}) {
  const [data, categories] = await Promise.all([
    getProducts(searchParams.search, searchParams.categoria),
    getCategories(),
  ]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <aside style={{ width: 220, flexShrink: 0 }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem',
              color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Categorias
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link href="/productos"
                style={{ padding: '0.5rem 0.75rem', borderRadius: 6, textDecoration: 'none',
                  fontSize: '0.9rem',
                  color: !searchParams.categoria ? 'var(--c-palm)' : 'var(--c-ink)',
                  background: !searchParams.categoria ? 'var(--c-palm-light)' : 'transparent',
                  fontWeight: !searchParams.categoria ? 500 : 400 }}>
                Todos los productos
              </Link>
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.id}`}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 6, textDecoration: 'none',
                    fontSize: '0.9rem',
                    color: searchParams.categoria === cat.id ? 'var(--c-palm)' : 'var(--c-ink)',
                    background: searchParams.categoria === cat.id ? 'var(--c-palm-light)' : 'transparent',
                    fontWeight: searchParams.categoria === cat.id ? 500 : 400 }}>
                  {cat.nameEs || cat.name}
                </Link>
              ))}
            </div>
          </aside>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400 }}>
                {searchParams.search ? `Resultados: "${searchParams.search}"` : 'Todos los productos'}
              </h1>
              <span style={{ fontSize: '0.875rem', color: 'var(--c-muted)' }}>
                {data.total} productos
              </span>
            </div>

            {data.products?.length > 0 ? (
              <div style={{ display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {data.products.map((product: any) => (
                  <Link key={product.id} href={`/productos/${product.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="card">
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--c-sand)' }}>
                        <img
                          src={product.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                          alt={product.nameEs || product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '0.875rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '0.2rem' }}>
                          {product.vendor?.businessName}
                        </p>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.nameEs || product.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--c-palm)' }}>
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.compareAtPrice && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--c-muted)',
                              textDecoration: 'line-through' }}>
                              ${Number(product.compareAtPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--c-muted)',
                background: 'white', borderRadius: 12, border: '1px solid var(--c-border)' }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>No se encontraron productos</p>
                <p style={{ fontSize: '0.85rem' }}>Intenta con otra categoria o busqueda</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
