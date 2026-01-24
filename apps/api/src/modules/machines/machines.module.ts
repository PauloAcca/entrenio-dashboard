import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

import { MachinesRepository } from './machines.repository';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [MachinesController],
  providers: [MachinesService, MachinesRepository],
  exports: [MachinesService],
})
export class MachinesModule { }