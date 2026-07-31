import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  // controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
