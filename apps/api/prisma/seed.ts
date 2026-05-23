import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dominican Hub database...');

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

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
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
  const clothing = await prisma.category.findUnique({ where: { slug: 'clothing' } });
  const home = await prisma.category.findUnique({ where: { slug: 'home-garden' } });

  const sampleProducts = [
    {
      name: 'Samsung S24 Case',
      nameEs: 'Funda Samsung S24',
      slug: 'funda-samsung-s24-001',
      price: 25.99,
      compareAtPrice: 34.99,
      categoryId: electronics!.id,
      originCountry: 'CN',
      hsCode: '3926.90',
      images: [{ url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', alt: 'Phone case', isPrimary: true }],
    },
    {
      name: 'Wireless Earbuds Pro',
      nameEs: 'Audifonos Inalambricos Pro',
      slug: 'audifonos-inalambricos-pro-001',
      price: 49.99,
      compareAtPrice: 79.99,
      categoryId: electronics!.id,
      originCountry: 'US',
      hsCode: '8518.30',
      images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', alt: 'Earbuds', isPrimary: true }],
    },
    {
      name: 'Linen Summer Dress',
      nameEs: 'Vestido de Lino Verano',
      slug: 'vestido-lino-verano-001',
      price: 38.00,
      categoryId: clothing!.id,
      originCountry: 'ES',
      images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', alt: 'Dress', isPrimary: true }],
    },
    {
      name: 'Ceramic Coffee Mug Set',
      nameEs: 'Set de Tazas de Ceramica',
      slug: 'set-tazas-ceramica-001',
      price: 32.50,
      compareAtPrice: 42.00,
      categoryId: home!.id,
      originCountry: 'GB',
      images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop', alt: 'Mugs', isPrimary: true }],
    },
    {
      name: 'Running Shoes',
      nameEs: 'Zapatos para Correr',
      slug: 'zapatos-correr-001',
      price: 89.99,
      categoryId: clothing!.id,
      originCountry: 'US',
      images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', alt: 'Shoes', isPrimary: true }],
    },
    {
      name: 'Smart Watch',
      nameEs: 'Reloj Inteligente',
      slug: 'reloj-inteligente-001',
      price: 129.99,
      compareAtPrice: 179.99,
      categoryId: electronics!.id,
      originCountry: 'CN',
      images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', alt: 'Watch', isPrimary: true }],
    },
    {
      name: 'Scented Candle Set',
      nameEs: 'Set de Velas Aromaticas',
      slug: 'velas-aromaticas-001',
      price: 24.99,
      categoryId: home!.id,
      originCountry: 'GB',
      images: [{ url: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop', alt: 'Candles', isPrimary: true }],
    },
    {
      name: 'Leather Wallet',
      nameEs: 'Billetera de Cuero',
      slug: 'billetera-cuero-001',
      price: 45.00,
      categoryId: clothing!.id,
      originCountry: 'IT',
      images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', alt: 'Wallet', isPrimary: true }],
    },
  ];

  for (const p of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name: p.name,
          nameEs: p.nameEs,
          slug: p.slug,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          categoryId: p.categoryId,
          originCountry: p.originCountry,
          hsCode: p.hsCode,
          stockQty: Math.floor(Math.random() * 50) + 10,
          status: 'ACTIVE',
          images: p.images,
        },
      });
    }
  }

  console.log('\nSeeding complete!');
  console.log('Admin:  admin@dominicanHub.com / Admin1234!');
  console.log('Buyer:  buyer@example.com / Buyer1234!');
  console.log('Vendor: vendor@example.com / Vendor1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
