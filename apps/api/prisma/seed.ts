import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dominican Hub database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@dominicanHub.com' },
    update: {},
    create: {
      email: 'admin@dominicanHub.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Dominican Hub',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  const buyerPassword = await bcrypt.hash('Buyer1234!', 12);
  await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      passwordHash: buyerPassword,
      firstName: 'Maria',
      lastName: 'Rodriguez',
      role: 'BUYER',
      phone: '+18091234567',
      isEmailVerified: true,
    },
  });

  const vendorPassword = await bcrypt.hash('Vendor1234!', 12);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      email: 'vendor@example.com',
      passwordHash: vendorPassword,
      firstName: 'Carlos',
      lastName: 'Perez',
      role: 'VENDOR',
      isEmailVerified: true,
    },
  });

  // ── Vendor ─────────────────────────────────────────────────────────────────
  // Delete existing vendor for this user so we can recreate cleanly
  const existingVendor = await prisma.vendor.findUnique({ where: { userId: vendorUser.id } });
  
  let vendor;
  if (existingVendor) {
    vendor = await prisma.vendor.update({
      where: { id: existingVendor.id },
      data: {
        businessName: 'Tienda Caribena',
        businessNameSlug: 'tienda-caribena',
        status: 'ACTIVE',
        description: 'Los mejores productos del Caribe y el mundo',
      },
    });
  } else {
    vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Tienda Caribena',
        businessNameSlug: 'tienda-caribena',
        email: 'vendor@example.com',
        country: 'DO',
        status: 'ACTIVE',
        commissionRate: 10.0,
        description: 'Los mejores productos del Caribe y el mundo',
      },
    });
  }
  console.log('Vendor:', vendor.businessName, '| ID:', vendor.id);

  // ── Logistics partner ──────────────────────────────────────────────────────
  await prisma.logisticsPartner.upsert({
    where: { slug: 'dominican-shipping' },
    update: {},
    create: {
      name: 'Dominican Shipping',
      slug: 'dominican-shipping',
      type: 'FREIGHT_FORWARDER',
      integrationMode: 'MANUAL',
      status: 'ACTIVE',
      contactEmail: 'ops@dominicanshipping.com',
      config: {},
      supportedRoutes: [
        { origin: 'GB', destination: 'DO' },
        { origin: 'US', destination: 'DO' },
        { origin: 'ES', destination: 'DO' },
      ],
    },
  });

  // ── Categories ─────────────────────────────────────────────────────────────
  const cats = [
    { name: 'Electronics', nameEs: 'Electronicos', slug: 'electronics' },
    { name: 'Clothing', nameEs: 'Ropa y Moda', slug: 'clothing' },
    { name: 'Food & Beverages', nameEs: 'Alimentos', slug: 'food-beverages' },
    { name: 'Home & Garden', nameEs: 'Hogar y Jardin', slug: 'home-garden' },
    { name: 'Health & Beauty', nameEs: 'Salud y Belleza', slug: 'health-beauty' },
    { name: 'Sports', nameEs: 'Deportes', slug: 'sports' },
    { name: 'Toys', nameEs: 'Juguetes', slug: 'toys' },
  ];
  for (const cat of cats) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }

  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const clothing   = await prisma.category.findUnique({ where: { slug: 'clothing' } });
  const home       = await prisma.category.findUnique({ where: { slug: 'home-garden' } });

  // ── Products — delete and recreate so images/status are correct ────────────
  console.log('Clearing old products...');
  await prisma.product.deleteMany({ where: { vendorId: vendor.id } });

  const products = [
    {
      name: 'Samsung S24 Case', nameEs: 'Funda Samsung S24',
      slug: 'funda-samsung-s24-001', price: 25.99, compareAtPrice: 34.99,
      categoryId: electronics!.id, originCountry: 'CN', hsCode: '3926.90',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
    },
    {
      name: 'Wireless Earbuds Pro', nameEs: 'Audifonos Inalambricos Pro',
      slug: 'audifonos-pro-001', price: 49.99, compareAtPrice: 79.99,
      categoryId: electronics!.id, originCountry: 'US', hsCode: '8518.30',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    },
    {
      name: 'Smart Watch', nameEs: 'Reloj Inteligente',
      slug: 'reloj-inteligente-001', price: 129.99, compareAtPrice: 179.99,
      categoryId: electronics!.id, originCountry: 'CN', hsCode: '9102.12',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    },
    {
      name: 'Linen Summer Dress', nameEs: 'Vestido de Lino Verano',
      slug: 'vestido-lino-001', price: 38.00, compareAtPrice: null,
      categoryId: clothing!.id, originCountry: 'ES', hsCode: '6204.49',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    },
    {
      name: 'Running Shoes', nameEs: 'Zapatos para Correr',
      slug: 'zapatos-correr-001', price: 89.99, compareAtPrice: null,
      categoryId: clothing!.id, originCountry: 'US', hsCode: '6402.99',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    },
    {
      name: 'Leather Wallet', nameEs: 'Billetera de Cuero',
      slug: 'billetera-cuero-001', price: 45.00, compareAtPrice: null,
      categoryId: clothing!.id, originCountry: 'IT', hsCode: '4202.31',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    },
    {
      name: 'Ceramic Coffee Mug Set', nameEs: 'Set de Tazas de Ceramica',
      slug: 'tazas-ceramica-001', price: 32.50, compareAtPrice: 42.00,
      categoryId: home!.id, originCountry: 'GB', hsCode: '6912.00',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    },
    {
      name: 'Scented Candle Set', nameEs: 'Set de Velas Aromaticas',
      slug: 'velas-aromaticas-001', price: 24.99, compareAtPrice: null,
      categoryId: home!.id, originCountry: 'GB', hsCode: '3406.00',
      image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop',
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: p.name,
        nameEs: p.nameEs,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        categoryId: p.categoryId,
        originCountry: p.originCountry,
        hsCode: p.hsCode,
        stockQty: Math.floor(Math.random() * 50) + 10,
        status: 'ACTIVE',
        images: [{ url: p.image, alt: p.nameEs, isPrimary: true }],
      },
    });
  }

  console.log(`Created ${products.length} products`);
  console.log('\nSeeding complete!');
  console.log('Admin:  admin@dominicanHub.com / Admin1234!');
  console.log('Buyer:  buyer@example.com / Buyer1234!');
  console.log('Vendor: vendor@example.com / Vendor1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
