
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from '../../integrations/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async login(loginDto: LoginDto) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.session) {
      throw new UnauthorizedException('No session created');
    }

    // After login, fetch the internal Owner profile
    // Note: We assume the Owner table has been populated with the same email
    const owner = await this.prisma.owner.findUnique({
      where: { email: loginDto.email },
      include: { gym: true },
    });

    if (!owner) {
        // Option: Create owner if not exists, or throw error. 
        // For now, we expect owner to exist or we return just the auth data with a warning/null
        throw new BadRequestException('Owner profile not found in database');
    }

    return {
      access_token: data.session.access_token,
      user: owner, // Return the full owner profile + gym
      supabase_user: data.user,
    };
  }
}
