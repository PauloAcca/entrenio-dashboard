import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersImportService } from './members-import.service';
import { MembersController } from './members.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

import { MembersRepository } from './members.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MembersService, MembersRepository, MembersImportService],
  exports: [MembersService]
})
export class MembersModule {}
