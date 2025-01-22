import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    console.log('Authorization Header:', authHeader); 

    if (!authHeader) {
      this.logger.warn('No Authorization header found in the request');
      throw new UnauthorizedException('Authorization header missing');
    }

    this.logger.debug(`Authorization header: ${authHeader}`);
    try {
      const result = await super.canActivate(context) as boolean;
      this.logger.debug(`JWT validation result: ${result}`);
      
      if (result) {
        this.logger.debug(`User attached to request: ${JSON.stringify(request.user)}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in JwtAuthGuard: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
