import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const API = 'http://localhost:3002/api/v1';

async function getProducts() {
  try {
    const res = await fetch(`${API}/products?limit=8`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch { return []; }
}

async function getCategories() {
  try {
    const res = await fetch(`${API}/products/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--c-palm-dark) 0%, var(--c-palm) 60%, #2d9e6e 100%)',
          padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px' }} />
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)',
              borderRadius: 20, padding: '0.3rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>
                🇩🇴 Desde UK, USA y Europa hasta la Republica Dominicana
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'white',
              fontWeight: 400, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Tu mercado caribeño,<br />
              <em>conectado al mundo</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.6,
              marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Compra productos de vendedores en todo el mundo con envio directo a la Republica Dominicana.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/productos" style={{ background: 'white', color: 'var(--c-palm)',
                padding: '0.8rem 2rem', borderRadius: 8, fontWeight: 600,
                textDecoration: 'none', fontSize: '0.95rem' }}>
                Ver productos
              </Link>
              <Link href="/track" style={{ background: 'transparent', color: 'white',
                padding: '0.8rem 2rem', borderRadius: 8, fontWeight: 500,
                textDecoration: 'none', fontSize: '0.95rem',
                border: '1.5px solid rgba(255,255,255,0.5)' }}>
                Rastrear envio
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: 'var(--c-gold-light)',
          borderBottom: '1px solid #eedba0', padding: '1rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex',
            justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Vendedores activos', value: '120+' },
              { label: 'Envios completados', value: '5,400+' },
              { label: 'Destinos en RD', value: '32' },
              { label: 'Paises de origen', value: '8' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem', color: 'var(--c-palm-dark)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section style={{ padding: '3rem 1.5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem',
              marginBottom: '1.25rem', fontWeight: 400 }}>Categorias</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.id}`}
                  style={{ padding: '0.5rem 1.25rem', background: 'white',
                    border: '1px solid var(--c-border)', borderRadius: 30,
                    fontSize: '0.875rem', color: 'var(--c-ink)', fontWeight: 500,
                    textDecoration: 'none' }}>
                  {cat.nameEs || cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products grid */}
        <section style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400 }}>
              Productos destacados
            </h2>
            <Link href="/productos" style={{ color: 'var(--c-palm)',
              textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Ver todos →
            </Link>
          </div>

          {products.length > 0 ? (
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {products.map((product: any) => (
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
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.nameEs || product.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-palm)', fontSize: '1rem' }}>
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
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Cargando productos...</p>
              <Link href="/productos" style={{ color: 'var(--c-palm)', fontSize: '0.875rem' }}>
                Ver catálogo completo
              </Link>
            </div>
          )}
        </section>

        {/* How it works */}
        <section style={{ background: 'var(--c-sand)', padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem',
              fontWeight: 400, marginBottom: '0.5rem' }}>Como funciona</h2>
            <p style={{ color: 'var(--c-muted)', marginBottom: '3rem' }}>
              Compra desde cualquier pais, recibe en la Republica Dominicana
            </p>
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              {[
                { step: '01', title: 'Elige tus productos', desc: 'Navega el catalogo de vendedores en UK, USA, Europa y RD' },
                { step: '02', title: 'Realiza tu pedido', desc: 'Pago seguro con tarjeta. Tu pedido va a nuestro almacen' },
                { step: '03', title: 'Consolidamos', desc: 'Dominican Shipping agrupa tu carga para optimizar el costo' },
                { step: '04', title: 'Recibe en RD', desc: 'Entrega a tu domicilio con seguimiento en tiempo real' },
              ].map(item => (
                <div key={item.step} style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem',
                    color: 'var(--c-palm)', opacity: 0.3, lineHeight: 1, marginBottom: '0.75rem' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ background: 'var(--c-palm-dark)',
          color: 'rgba(255,255,255,0.7)', padding: '2.5rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.2)',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 700 }}>D</span>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.1rem' }}>
                Dominican Hub
              </span>
            </div>
            <p style={{ fontSize: '0.8rem' }}>© 2026 Dominican Hub. Infraestructura de comercio caribeño.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
