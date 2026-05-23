import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('User already has a vendor account');

    const slug = slugify(dto.businessName);
    const slugExists = await this.prisma.vendor.findUnique({ where: { businessNameSlug: slug } });
    if (slugExists) throw new ConflictException('Business name already taken');

    return this.prisma.vendor.create({
      data: {
        userId,
        businessName: dto.businessName,
        businessNameSlug: slug,
        email: dto.email,
        phone: dto.phone,
        country: dto.country ?? 'DO',
        description: dto.description,
      },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        products: { where: { status: 'ACTIVE' }, take: 8, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async getDashboard(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const [totalProducts, totalOrders, pendingOrders] = await Promise.all([
      this.prisma.product.count({ where: { vendorId: vendor.id } }),
      this.prisma.orderItem.count({ where: { vendorId: vendor.id } }),
      this.prisma.orderItem.count({
        where: { vendorId: vendor.id, order: { status: 'PAYMENT_CONFIRMED' } },
      }),
    ]);

    const recentOrders = await this.prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true, status: true, createdAt: true } },
        product: { select: { name: true, images: true } },
      },
    });

    return { vendor, stats: { totalProducts, totalOrders, pendingOrders }, recentOrders };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where: { status: 'ACTIVE' },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, businessName: true, businessNameSlug: true,
          description: true, logoUrl: true, rating: true, country: true,
        },
      }),
      this.prisma.vendor.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { vendors, total, page, totalPages: Math.ceil(total / limit) };
  }
}
