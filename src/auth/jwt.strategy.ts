import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: any) {
    this.logger.debug(`Decoded JWT Payload: ${JSON.stringify(payload)}`);

    if (!payload) {
      this.logger.error('JWT validation failed: Payload is null or undefined');
      throw new UnauthorizedException('Invalid token payload');
    }

    const { email, role, id } = payload;

    if (!email || !role || !id) {
      this.logger.error(
        `JWT validation failed: Missing required fields in payload. Payload: ${JSON.stringify(payload)}`
      );
      throw new UnauthorizedException('Invalid token payload: Missing required fields');
    }

    this.logger.log(`JWT validation successful for email: ${email}, role: ${role}, id: ${id}`);
    return { email, role, id };
  }
}
