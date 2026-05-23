// ─────────────────────────────────────────────────────────────────────────────
// Dominican Hub — Shared TypeScript types
// Used by both apps/api and apps/web
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'BUYER'
  | 'VENDOR'
  | 'ADMIN'
  | 'LOGISTICS_OPERATOR'
  | 'CUSTOMS_AGENT'
  | 'DRIVER'
  | 'SUPER_ADMIN';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'AWAITING_LOGISTICS'
  | 'LOGISTICS_ASSIGNED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'DISPUTE';

export type ShipmentStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AT_CUSTOMS'
  | 'CUSTOMS_CLEARED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'RETURNED'
  | 'EXCEPTION';

export type IntegrationMode = 'API' | 'WEBHOOK' | 'CSV' | 'MANUAL';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  vendor?: { id: string; businessName: string; status: string } | null;
}
