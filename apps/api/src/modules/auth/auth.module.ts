import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { SupabaseModule } from '../../integrations/supabase/supabase.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
