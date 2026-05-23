import { Injectable, Logger } from '@nestjs/common';
import {
  LogisticsAdapter,
  AssignShipmentInput,
  AssignShipmentResult,
  TrackingStatus,
  StatusUpdateHandler,
  GeneratedDocument,
} from '../../adapter.interface';

/**
 * ManualAdapter - no API required.
 * Admin enters tracking numbers and status updates via the admin panel.
 */
@Injectable()
export class ManualAdapter implements LogisticsAdapter {
  readonly slug = 'manual';
  readonly name = 'Manual (Admin Updates)';

  private readonly logger = new Logger(ManualAdapter.name);
  private statusHandler?: StatusUpdateHandler;

  async assignShipment(input: AssignShipmentInput): Promise<AssignShipmentResult> {
    this.logger.log(`Manual assignment for order ${input.order.id}`);
    return {
      success: true,
      message: 'Order assigned. Enter tracking details manually in admin panel.',
    };
  }

  async getTrackingStatus(_externalRef: string): Promise<TrackingStatus | null> {
    return null; // No polling for manual adapter
  }

  onStatusUpdate(handler: StatusUpdateHandler): void {
    this.statusHandler = handler;
  }

  async pushManualUpdate(externalRef: string, status: TrackingStatus): Promise<void> {
    if (this.statusHandler) {
      await this.statusHandler(externalRef, status);
    }
  }

  async generateDocuments(_order: AssignShipmentInput['order']): Promise<GeneratedDocument[]> {
    return []; // AI document generation added in Phase 3
  }

  async healthCheck() {
    return { healthy: true, message: 'Manual adapter always healthy' };
  }
}
