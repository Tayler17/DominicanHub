import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    if (key && key !== 'sk_test_...') {
      this.stripe = new Stripe(key, { apiVersion: '2024-04-10' });
    }
  }

  async createPaymentIntent(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Order is not pending payment');
    }

    const amount = Math.round(Number(order.total) * 100); // Stripe uses cents

    if (!this.stripe) {
      // Dev mode without Stripe key — return mock intent
      return {
        clientSecret: `mock_${orderId}_${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.total),
        currency: order.currency,
        mode: 'mock',
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: order.currency.toLowerCase(),
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      currency: order.currency,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) return { received: true };

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) return { received: true };

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata.orderId;
        if (orderId) {
          await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'PAYMENT_CONFIRMED', paidAt: new Date(), paymentMethod: pi.payment_method_types[0] },
          });
          // Create commissions for each vendor in this order
          const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });
          if (order) {
            const vendorTotals = new Map<string, number>();
            for (const item of order.items) {
              const current = vendorTotals.get(item.vendorId) || 0;
              vendorTotals.set(item.vendorId, current + Number(item.totalPrice));
            }
            for (const [vendorId, orderTotal] of vendorTotals) {
              const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
              if (vendor) {
                const rate = Number(vendor.commissionRate) / 100;
                const commissionAmount = orderTotal * rate;
                const vendorAmount = orderTotal - commissionAmount;
                await this.prisma.commission.create({
                  data: { orderId, vendorId, orderTotal, commissionRate: vendor.commissionRate,
                    commissionAmount, vendorAmount, status: 'HELD', heldAt: new Date() },
                });
              }
            }
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata.orderId;
        if (orderId) {
          await this.prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
        }
        break;
      }
    }
    return { received: true };
  }
}
