import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  LogisticsAdapter,
  AssignShipmentInput,
  AssignShipmentResult,
  TrackingStatus,
  StatusUpdateHandler,
  GeneratedDocument,
  OrderForShipment,
} from '../../adapter.interface';

@Injectable()
export class DominicanShippingAdapter implements LogisticsAdapter {
  readonly slug = 'dominican-shipping';
  readonly name = 'Dominican Shipping';

  private readonly logger = new Logger(DominicanShippingAdapter.name);
  private statusHandler?: StatusUpdateHandler;
  private http?: AxiosInstance;
  private mode: 'api' | 'manual';

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('DOMINICAN_SHIPPING_API_KEY');
    const baseUrl = config.get<string>('DOMINICAN_SHIPPING_BASE_URL');
    this.mode = apiKey && baseUrl ? 'api' : 'manual';

    if (this.mode === 'api') {
      this.http = axios.create({
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      this.logger.log('Dominican Shipping adapter: API mode');
    } else {
      this.logger.log('Dominican Shipping adapter: Manual mode');
    }
  }

  async assignShipment(input: AssignShipmentInput): Promise<AssignShipmentResult> {
    if (this.mode === 'api' && this.http) {
      try {
        const response = await this.http.post('/shipments', {
          orderId: input.order.id,
          orderNumber: input.order.orderNumber,
          recipient: {
            name: `${input.order.buyer.firstName ?? ''} ${input.order.buyer.lastName ?? ''}`.trim(),
            email: input.order.buyer.email,
            phone: input.order.buyer.phone,
            address: input.order.address,
          },
          items: input.order.items.map((item) => ({
            description: (item.productSnapshot as Record<string, unknown>)?.['name'],
            quantity: item.quantity,
            weight: (item.productSnapshot as Record<string, unknown>)?.['weightKg'],
            hsCode: (item.productSnapshot as Record<string, unknown>)?.['hsCode'],
            declaredValue: Number(item.unitPrice) * item.quantity,
          })),
          notes: input.notes,
        });
        return {
          success: true,
          externalRef: response.data.reference,
          trackingNumber: response.data.trackingNumber,
          estimatedDelivery: response.data.estimatedDelivery
            ? new Date(response.data.estimatedDelivery)
            : undefined,
        };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Dominican Shipping API error: ${msg}`);
        return { success: false, message: `API error: ${msg}` };
      }
    }
    return {
      success: true,
      message: 'Assigned to Dominican Shipping. Enter tracking reference manually.',
    };
  }

  async getTrackingStatus(externalRef: string): Promise<TrackingStatus | null> {
    if (this.mode !== 'api' || !this.http) return null;
    try {
      const { data } = await this.http.get(`/shipments/${externalRef}/status`);
      return {
        externalRef,
        currentStatus: data.status,
        normalizedStatus: this.normalizeStatus(data.status),
        location: data.currentLocation,
        description: data.statusDescription,
        occurredAt: new Date(data.updatedAt),
        rawPayload: data,
      };
    } catch {
      return null;
    }
  }

  onStatusUpdate(handler: StatusUpdateHandler): void {
    this.statusHandler = handler;
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<void> {
    if (!this.statusHandler) return;
    const status: TrackingStatus = {
      externalRef: payload['reference'] as string,
      currentStatus: payload['status'] as string,
      normalizedStatus: this.normalizeStatus(payload['status'] as string),
      location: payload['location'] as string | undefined,
      description: payload['description'] as string | undefined,
      occurredAt: new Date((payload['timestamp'] as string) ?? Date.now()),
      rawPayload: payload,
    };
    await this.statusHandler(payload['reference'] as string, status);
  }

  async generateDocuments(_order: OrderForShipment): Promise<GeneratedDocument[]> {
    return [];
  }

  async healthCheck() {
    if (this.mode === 'manual') {
      return { healthy: true, message: 'Manual mode — no API to check' };
    }
    try {
      await this.http!.get('/health');
      return { healthy: true };
    } catch {
      return { healthy: false, message: 'Dominican Shipping API unreachable' };
    }
  }

  private normalizeStatus(partnerStatus: string): string {
    const map: Record<string, string> = {
      received: 'CREATED',
      picked_up: 'PICKED_UP',
      in_transit: 'IN_TRANSIT',
      at_customs: 'AT_CUSTOMS',
      cleared: 'CUSTOMS_CLEARED',
      out_for_delivery: 'OUT_FOR_DELIVERY',
      delivered: 'DELIVERED',
      failed: 'FAILED_DELIVERY',
      returned: 'RETURNED',
    };
    return map[partnerStatus?.toLowerCase()] ?? 'IN_TRANSIT';
  }
}
