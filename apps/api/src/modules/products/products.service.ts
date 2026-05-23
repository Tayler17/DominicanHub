import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Date.now();
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('No vendor account found. Please register as a vendor first.');

    const slug = slugify(dto.name);
    return this.prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: dto.name,
        nameEs: dto.nameEs,
        slug,
        description: dto.description,
        descriptionEs: dto.descriptionEs,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        weightKg: dto.weightKg,
        hsCode: dto.hsCode,
        originCountry: dto.originCountry,
        stockQty: dto.stockQty ?? 0,
        categoryId: dto.categoryId,
        status: dto.status ?? 'DRAFT',
        images: [],
      },
      include: { vendor: { select: { id: true, businessName: true } }, category: true },
    });
  }

  async findAll(page = 1, limit = 24, categoryId?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'ACTIVE' };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameEs: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { id: true, businessName: true, businessNameSlug: true, logoUrl: true } },
          category: { select: { id: true, name: true, nameEs: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        vendor: { select: { id: true, businessName: true, businessNameSlug: true, logoUrl: true, rating: true } },
        category: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByVendor(userId: string, page = 1, limit = 20) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { vendorId: vendor.id },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true, nameEs: true } } },
      }),
      this.prisma.product.count({ where: { vendorId: vendor.id } }),
    ]);
    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
