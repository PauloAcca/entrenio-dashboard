import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { SupabaseModule } from './integrations/supabase/supabase.module';
import { MachinesModule } from './modules/machines/machines.module';
import { MembersModule } from './modules/members/members.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, 
    PrismaModule, 
    SupabaseModule,
    MachinesModule,
    MembersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
