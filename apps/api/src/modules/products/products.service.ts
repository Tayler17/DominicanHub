import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

function makeSlug(text: string): string {
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
    if (!vendor) throw new ForbiddenException('No vendor account found.');

    const slug = makeSlug(dto.name);
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
      include: {
        vendor: { select: { id: true, businessName: true } },
        category: true,
      },
    });
  }

  async findAll(page?: number, limit?: number, categoryId?: string, search?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 24;
    const skip = (p - 1) * l;

    // Build where clause carefully
    const where: Record<string, any> = { status: 'ACTIVE' };

    if (categoryId && categoryId.trim()) {
      where['categoryId'] = categoryId.trim();
    }

    if (search && search.trim()) {
      where['OR'] = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { nameEs: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessNameSlug: true,
              logoUrl: true,
            },
          },
          category: {
            select: { id: true, name: true, nameEs: true, slug: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessNameSlug: true,
            logoUrl: true,
            rating: true,
          },
        },
        category: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByVendor(userId: string, page?: number, limit?: number) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { vendorId: vendor.id },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true, nameEs: true } } },
      }),
      this.prisma.product.count({ where: { vendorId: vendor.id } }),
    ]);

    return { products, total, page: p, totalPages: Math.ceil(total / l) };
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: { children: { where: { isActive: true } } },
    });
  }
}
