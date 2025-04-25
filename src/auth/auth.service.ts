import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, SignInDto, UserRole } from './dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password, role } = signUpDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(role && { role }),
      },
    });

    const token = await this.generateToken(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.password, password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  private async generateToken(userId: string, email: string) {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwtService.signAsync(payload);
  }
}
