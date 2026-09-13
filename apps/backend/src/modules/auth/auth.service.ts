import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const res = await this.db.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );
    const user = res.rows[0];

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'karsa_jwt_access_secret_production_key_32chars',
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'karsa_jwt_refresh_secret_production_key_32chars',
      expiresIn: '7d',
    });

    // Ambil organisasi yang diikuti user
    const orgRes = await this.db.query(
      `SELECT o.id, o.name, o.slug, o.logo_url as "logoUrl", o.status, om.role as "myRole",
              (SELECT p.name FROM subscriptions s JOIN subscription_plans p ON s.plan_id = p.id WHERE s.organization_id = o.id ORDER BY s.created_at DESC LIMIT 1) as "currentPlan"
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1 AND om.is_active = true
       ORDER BY o.created_at ASC`,
      [user.id],
    );

    const organizations = orgRes.rows;
    const activeOrganization = organizations[0] || null;

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organizations,
      activeOrganization,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'karsa_jwt_refresh_secret_production_key_32chars',
      });
      const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET || 'karsa_jwt_access_secret_production_key_32chars',
        expiresIn: '1h',
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Sesi refresh token tidak valid atau kedaluwarsa');
    }
  }
}
