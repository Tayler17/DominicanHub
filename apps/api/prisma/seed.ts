import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dominican Hub database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
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
  console.log('Admin user:', admin.email);

  // Test buyer
  const buyerPassword = await bcrypt.hash('Buyer1234!', 12);
  const buyer = await prisma.user.upsert({
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
  console.log('Buyer user:', buyer.email);

  // Test vendor
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
      businessName: 'Tienda Caribeña',
      businessNameSlug: 'tienda-caribena',
      email: 'vendor@example.com',
      country: 'DO',
      status: 'ACTIVE',
      commissionRate: 10.0,
    },
  });
  console.log('Vendor:', vendor.businessName);

  // Dominican Shipping logistics partner
  const dShipping = await prisma.logisticsPartner.upsert({
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
  console.log('Logistics partner:', dShipping.name);

  // Categories
  const categories = [
    { name: 'Electronics', nameEs: 'Electronicos', slug: 'electronics' },
    { name: 'Clothing', nameEs: 'Ropa', slug: 'clothing' },
    { name: 'Food & Beverages', nameEs: 'Alimentos', slug: 'food-beverages' },
    { name: 'Home & Garden', nameEs: 'Hogar', slug: 'home-garden' },
    { name: 'Health & Beauty', nameEs: 'Salud y Belleza', slug: 'health-beauty' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Sample products
  const electronicsCategory = await prisma.category.findUnique({
    where: { slug: 'electronics' },
  });

  await prisma.product.upsert({
    where: { slug: 'smartphone-case-samsung-s24' },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: electronicsCategory!.id,
      name: 'Samsung S24 Case',
      nameEs: 'Funda Samsung S24',
      slug: 'smartphone-case-samsung-s24',
      description: 'Premium protective case for Samsung Galaxy S24',
      price: 25.99,
      currency: 'USD',
      weightKg: 0.1,
      originCountry: 'CN',
      hsCode: '3926.90',
      stockQty: 50,
      status: 'ACTIVE',
      images: [{ url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', alt: 'Phone case', isPrimary: true }],
    },
  });
  console.log('Sample product created');

  console.log('\nSeeding complete!');
  console.log('Admin:  admin@dominicanHub.com / Admin1234!');
  console.log('Buyer:  buyer@example.com / Buyer1234!');
  console.log('Vendor: vendor@example.com / Vendor1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
