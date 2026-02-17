
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
    const email = loginDto.email.toLowerCase();

    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email,
      password: loginDto.password,
    });

    if (error) {
      console.error('Supabase Login Error:', error);
      if (error.message === 'Invalid login credentials') {
        throw new UnauthorizedException('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
      throw new UnauthorizedException('Error al iniciar sesión: ' + error.message);
    }

    if (!data.session) {
      throw new UnauthorizedException('No se pudo establecer la sesión.');
    }

    // After login, fetch the internal Owner profile
    const owner = await this.prisma.owner.findUnique({
      where: { email },
      include: { gym: true },
    });

    if (!owner) {
        throw new BadRequestException('Este usuario no está registrado como administrador en nuestra base de datos.');
    }

    return {
      access_token: data.session.access_token,
      user: owner, // Return the full owner profile + gym
      supabase_user: data.user,
    };
  }
}
