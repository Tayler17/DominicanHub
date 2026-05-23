import { Order, Shipment } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Dominican Hub — Logistics Adapter Interface
//
// Every logistics partner (Dominican Shipping, DHL, a warehouse, a customs
// broker) implements this interface. The orchestration layer calls the
// interface — it does not care whether the adapter uses a REST API, a CSV
// import, or a human admin entering data manually underneath.
// ─────────────────────────────────────────────────────────────────────────────

export interface AssignShipmentInput {
  order: Order & {
    items: Array<{ productSnapshot: any; quantity: number; unitPrice: any }>;
    address: any;
    buyer: { email: string; phone?: string; firstName?: string; lastName?: string };
  };
  notes?: string;
}

export interface AssignShipmentResult {
  success: boolean;
  externalRef?: string;       // partner's own reference number
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
  message?: string;
}

export interface TrackingStatus {
  externalRef: string;
  currentStatus: string;      // partner's status string
  normalizedStatus: string;   // maps to our ShipmentStatus enum
  location?: string;
  description?: string;
  occurredAt: Date;
  rawPayload?: any;
}

export interface GeneratedDocument {
  type: string;               // 'customs_declaration' | 'packing_list' | etc.
  url: string;
  filename: string;
}

export type StatusUpdateHandler = (
  externalRef: string,
  status: TrackingStatus,
) => Promise<void>;

export interface LogisticsAdapter {
  /** Unique slug identifying this adapter (e.g. 'dominican-shipping') */
  readonly slug: string;

  /** Human-readable name for display in admin panel */
  readonly name: string;

  /**
   * Assign an order to this logistics partner.
   * API adapters: calls the partner's API.
   * Manual adapter: saves the assignment, admin fills in details later.
   */
  assignShipment(input: AssignShipmentInput): Promise<AssignShipmentResult>;

  /**
   * Get the latest tracking status for a shipment by external reference.
   * May return null if the partner's system has no update.
   */
  getTrackingStatus(externalRef: string): Promise<TrackingStatus | null>;

  /**
   * Register a handler that will be called when this adapter receives
   * a status update (via webhook or polling).
   */
  onStatusUpdate(handler: StatusUpdateHandler): void;

  /**
   * Generate shipping/customs documents for an order.
   * Returns URLs to the generated PDFs.
   */
  generateDocuments(order: AssignShipmentInput['order']): Promise<GeneratedDocument[]>;

  /**
   * Check whether this adapter is properly configured and reachable.
   */
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
