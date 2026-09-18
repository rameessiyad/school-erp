import { StaffDesignationEnum } from 'generated/prisma/enums';
import { Module } from './module.enum';
import { STAFF_MODULE_PERMISSIONS } from './staff-permissions.config';

export function getAllowedModules(designation: StaffDesignationEnum): Module[] {
  return STAFF_MODULE_PERMISSIONS[designation] ?? [];
}
