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
} from '../../adapter.interface';

/**
 * DominicanShippingAdapter
 *
 * Integrates with Dominican Shipping as the primary logistics partner.
 * Supports two modes controlled by config:
 *   - 'api'    — calls Dominican Shipping REST API if they have one
 *   - 'manual' — falls back to admin-entered updates (same as ManualAdapter)
 *
 * As Dominican Shipping expands their tech capabilities, this adapter
 * can be upgraded without changing any other part of the platform.
 */
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
      this.logger.log('Dominican Shipping adapter: Manual mode (no API credentials configured)');
    }
  }

  async assignShipment(input: AssignShipmentInput): Promise<AssignShipmentResult> {
    if (this.mode === 'api' && this.http) {
      try {
        const response = await this.http.post('/shipments', {
          orderId: input.order.id,
          orderNumber: input.order.orderNumber,
          recipient: {
            name: `${input.order.buyer.firstName} ${input.order.buyer.lastName}`,
            email: input.order.buyer.email,
            phone: input.order.buyer.phone,
            address: input.order.address,
          },
          items: input.order.items.map((item) => ({
            description: item.productSnapshot?.name,
            quantity: item.quantity,
            weight: item.productSnapshot?.weightKg,
            hsCode: item.productSnapshot?.hsCode,
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
      } catch (error) {
        this.logger.error(`Dominican Shipping API error: ${error.message}`);
        return { success: false, message: `API error: ${error.message}` };
      }
    }
    // Manual fallback
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

  /**
   * Called when Dominican Shipping sends a webhook to our platform.
   * Endpoint: POST /api/v1/webhooks/dominican-shipping
   */
  async handleWebhook(payload: any): Promise<void> {
    if (!this.statusHandler) return;
    const status: TrackingStatus = {
      externalRef: payload.reference,
      currentStatus: payload.status,
      normalizedStatus: this.normalizeStatus(payload.status),
      location: payload.location,
      description: payload.description,
      occurredAt: new Date(payload.timestamp || Date.now()),
      rawPayload: payload,
    };
    await this.statusHandler(payload.reference, status);
  }

  async generateDocuments(order: AssignShipmentInput['order']): Promise<GeneratedDocument[]> {
    return []; // Phase 3: AI-generated customs declaration
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
      'received': 'CREATED',
      'picked_up': 'PICKED_UP',
      'in_transit': 'IN_TRANSIT',
      'at_customs': 'AT_CUSTOMS',
      'cleared': 'CUSTOMS_CLEARED',
      'out_for_delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED',
      'failed': 'FAILED_DELIVERY',
      'returned': 'RETURNED',
    };
    return map[partnerStatus?.toLowerCase()] || 'IN_TRANSIT';
  }
}
