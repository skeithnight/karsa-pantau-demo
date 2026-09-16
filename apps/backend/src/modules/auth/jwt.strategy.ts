import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET wajib diset di production.');
  }
  return 'karsa_dev_fallback_jwt_secret_not_for_production';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const res = await this.db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);
    const user = res.rows[0];
    if (!user) {
      throw new UnauthorizedException('Pengguna tidak valid atau sesi telah berakhir');
    }
    return user;
  }
}
