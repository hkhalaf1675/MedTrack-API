import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { buildFailResponse } from '../utils/api-response';
import { ErrorMessages } from '../constants/error-messages';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import dataSource from '../../database/data-source';
import { User } from '../../modules/users/entities/user.entity';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ){}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>{
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if(!token){
      throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.TOKEN_REQUIRED]));
    }

    try {
      const { userId } = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret')
      });

      if(!userId) {
        throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.UNAUTHORIZED]));
      }

      const myDataSource = dataSource;
      if(!myDataSource.isInitialized){
        await myDataSource.initialize();
      }

      const user = await myDataSource.manager.findOneBy(User, { id: userId });
      if(!user){
        throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.UNAUTHORIZED]));
      }

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]);
      if(requiredRoles && requiredRoles.length > 0){
        if(!requiredRoles.includes(user.role)){
          throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.UNAUTHORIZED]));
        }
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.UNAUTHORIZED]));
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') || [];
    return (type === 'Bearer') ? token : undefined;
  }
}
