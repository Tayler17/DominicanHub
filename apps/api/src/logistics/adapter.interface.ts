// ─────────────────────────────────────────────────────────────────────────────
// Dominican Hub — Logistics Adapter Interface
//
// Every logistics partner implements this interface.
// The orchestration layer calls the interface — it does not care whether
// the adapter uses a REST API, a CSV import, or manual admin input.
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderForShipment {
  id: string;
  orderNumber: string;
  total: unknown;
  currency: string;
  notes?: string | null;
  items: Array<{
    productSnapshot: Record<string, unknown>;
    quantity: number;
    unitPrice: unknown;
  }>;
  address: Record<string, unknown> | null;
  buyer: {
    email: string;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface AssignShipmentInput {
  order: OrderForShipment;
  notes?: string;
}

export interface AssignShipmentResult {
  success: boolean;
  externalRef?: string;
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
  message?: string;
}

export interface TrackingStatus {
  externalRef: string;
  currentStatus: string;
  normalizedStatus: string;
  location?: string;
  description?: string;
  occurredAt: Date;
  rawPayload?: unknown;
}

export interface GeneratedDocument {
  type: string;
  url: string;
  filename: string;
}

export type StatusUpdateHandler = (
  externalRef: string,
  status: TrackingStatus,
) => Promise<void>;

export interface LogisticsAdapter {
  readonly slug: string;
  readonly name: string;

  assignShipment(input: AssignShipmentInput): Promise<AssignShipmentResult>;
  getTrackingStatus(externalRef: string): Promise<TrackingStatus | null>;
  onStatusUpdate(handler: StatusUpdateHandler): void;
  generateDocuments(order: OrderForShipment): Promise<GeneratedDocument[]>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
