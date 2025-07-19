import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { buildFailResponse, buildSuccessResponse } from '../../common/utils/api-response';
import { ErrorMessages } from '../../common/constants/error-messages';
import { compareText, hashText } from '../../common/utils/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOneBy({ email: registerDto.email });

    if(existingUser){
      throw new BadRequestException(buildFailResponse(400, [ErrorMessages.USER.EMAIL_EXISTS]));
    }

    const hashedPassword = await hashText(registerDto.password);
    const user = this.userRepository.create({ ...registerDto, password: hashedPassword });
    await this.userRepository.save(user);

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    const { password, ...savedUser } = user;
    return buildSuccessResponse('You have been registered successfully', { user: savedUser , token });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'name', 'email', 'password']
    });

    if(!user){
      throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.INVALID_CREDENTIALS]));
    }

    const isPasswordCorrect = await compareText(loginDto.password, user.password);
    if(!isPasswordCorrect) {
      throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.INVALID_CREDENTIALS]));
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    const { password, ...userWithoutPassword } = user;
    return buildSuccessResponse('You have been logged in successfully', { user: userWithoutPassword, token });
  }
}
