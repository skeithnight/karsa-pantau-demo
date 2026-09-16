import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service';

/**
 * Helper: Ambil JWT secret dari env var. Fail-fast di production jika tidak diset.
 * Di development, fallback ke default secret untuk kemudahan local dev.
 */
function getJwtSecret(envKey: string): string {
  const secret = process.env[envKey];
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`FATAL: Environment variable '${envKey}' wajib diset di production. Aplikasi tidak boleh berjalan tanpa secret JWT yang aman.`);
  }
  return `karsa_dev_fallback_${envKey.toLowerCase()}_not_for_production`;
}

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
      secret: getJwtSecret('JWT_SECRET'),
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: getJwtSecret('JWT_REFRESH_SECRET'),
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
        secret: getJwtSecret('JWT_REFRESH_SECRET'),
      });
      const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: getJwtSecret('JWT_SECRET'),
        expiresIn: '1h',
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Sesi refresh token tidak valid atau kedaluwarsa');
    }
  }
}
