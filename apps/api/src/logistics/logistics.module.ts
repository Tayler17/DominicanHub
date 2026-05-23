import { Module } from '@nestjs/common';
import { AdapterRegistry } from './adapter.registry';
import { ManualAdapter } from './adapters/manual/manual.adapter';
import { DominicanShippingAdapter } from './adapters/dominican-shipping/dominican-shipping.adapter';

@Module({
  providers: [ManualAdapter, DominicanShippingAdapter, AdapterRegistry],
  exports: [AdapterRegistry],
})
export class LogisticsModule {}
