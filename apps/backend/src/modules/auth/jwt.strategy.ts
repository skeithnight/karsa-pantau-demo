import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'karsa_jwt_access_secret_production_key_32chars',
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
