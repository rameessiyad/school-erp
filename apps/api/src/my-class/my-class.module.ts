import { Module } from '@nestjs/common';
import { MyClassService } from './my-class.service';
import { MyClassController } from './my-class.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MyClassService],
  controllers: [MyClassController],
})
export class MyClassModule {}
