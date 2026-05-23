import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  BUYER = 'BUYER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  LOGISTICS_OPERATOR = 'LOGISTICS_OPERATOR',
  CUSTOMS_AGENT = 'CUSTOMS_AGENT',
  DRIVER = 'DRIVER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
