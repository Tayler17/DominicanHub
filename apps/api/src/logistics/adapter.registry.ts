import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogisticsAdapter } from './adapter.interface';
import { ManualAdapter } from './adapters/manual/manual.adapter';
import { DominicanShippingAdapter } from './adapters/dominican-shipping/dominican-shipping.adapter';

/**
 * AdapterRegistry — central registry for all logistics adapters.
 * 
 * To add a new carrier/partner:
 *   1. Create a class implementing LogisticsAdapter
 *   2. Register it here with its slug
 *   3. The admin panel will automatically show it as an assignable partner
 */
@Injectable()
export class AdapterRegistry {
  private readonly logger = new Logger(AdapterRegistry.name);
  private adapters = new Map<string, LogisticsAdapter>();

  constructor(
    private manual: ManualAdapter,
    private dominicanShipping: DominicanShippingAdapter,
  ) {
    this.register(manual);
    this.register(dominicanShipping);
    this.logger.log(`Registered adapters: ${[...this.adapters.keys()].join(', ')}`);
  }

  register(adapter: LogisticsAdapter): void {
    this.adapters.set(adapter.slug, adapter);
  }

  get(slug: string): LogisticsAdapter {
    const adapter = this.adapters.get(slug);
    if (!adapter) {
      throw new NotFoundException(`Logistics adapter not found: ${slug}`);
    }
    return adapter;
  }

  getAll(): LogisticsAdapter[] {
    return [...this.adapters.values()];
  }

  list(): { slug: string; name: string }[] {
    return [...this.adapters.values()].map((a) => ({
      slug: a.slug,
      name: a.name,
    }));
  }
}
