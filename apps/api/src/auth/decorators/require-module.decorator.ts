import { SetMetadata } from '@nestjs/common';
import { Module } from 'src/common/permissions/module.enum';

export const REQUIRE_MODULE_KEY = 'requireModule';
export const RequireModule = (module: Module) =>
  SetMetadata(REQUIRE_MODULE_KEY, module);
