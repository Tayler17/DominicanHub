import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `DH-${year}-${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Fetch all products
    const productIds = dto.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { vendor: { select: { id: true, businessName: true } } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found or unavailable');
    }

    // Build order items with snapshots
    const orderItems = dto.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const unitPrice = Number(product.price);
      return {
        productId: product.id,
        vendorId: product.vendor.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        productSnapshot: {
          name: product.name,
          nameEs: product.nameEs,
          price: unitPrice,
          images: product.images,
          weightKg: product.weightKg,
          hsCode: product.hsCode,
          originCountry: product.originCountry,
        },
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const shippingCost = 15.00; // Fixed for MVP — will be dynamic with Shippo
    const total = subtotal + shippingCost;

    const order = await this.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: userId,
        addressId: dto.addressId,
        status: 'PENDING_PAYMENT',
        subtotal,
        shippingCost,
        total,
        currency: 'USD',
        notes: dto.notes,
        items: { create: orderItems },
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, nameEs: true, images: true } },
            vendor: { select: { businessName: true } },
          },
        },
      },
    });

    return order;
  }

  async findAll(userId: string, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = role === 'ADMIN' ? {} : { buyerId: userId };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: { select: { name: true, nameEs: true, images: true } } },
          },
          shipments: { select: { status: true, trackingNumber: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        address: true,
        items: {
          include: {
            product: { select: { name: true, nameEs: true, images: true, slug: true } },
            vendor: { select: { id: true, businessName: true } },
          },
        },
        shipments: {
          include: { events: { orderBy: { occurredAt: 'desc' }, take: 10 } },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (role !== 'ADMIN' && order.buyerId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(id: string, status: string, adminId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
