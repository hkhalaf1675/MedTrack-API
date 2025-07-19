import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hashText } from '../../common/utils/bcrypt';
import { ErrorMessages } from '../../common/constants/error-messages';
import { buildFailResponse, buildPaginationResponse, buildSuccessResponse } from '../../common/utils/api-response';
import { IUserQuery } from './interfaces/user-query.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      ...(createUserDto.phone ? { phone: createUserDto.phone } : {})
    });

    if(existingUser) {
      if(existingUser.email == createUserDto.email){
        throw new BadRequestException(buildFailResponse(
          400,
          [ErrorMessages.USER.EMAIL_EXISTS]
        ));
      }

      throw new BadRequestException(buildFailResponse(
          400,
          [ErrorMessages.USER.PHONE_EXISTS]
        ));
    }

    const hashedPassword = await hashText(createUserDto.password);
    const user = this.userRepository.create({...createUserDto, password: hashedPassword });
    await this.userRepository.save(user);

    const { password, ...savedUser } = user;

    return buildSuccessResponse('User has been added successfully', { user: savedUser });
  }

  async findAll(query: IUserQuery) {
    let { page, perPage, role, name } = query;
    page = page ?? 1;
    perPage = perPage ?? 10;

    const userQueryBuilder = this.userRepository.createQueryBuilder('user');

    if(name) {
      userQueryBuilder.where('user.name LIKE :name', { name: `%${name}%`});
    }
    if(role) {
      userQueryBuilder.andWhere('user.role = :role', { role });
    }

    userQueryBuilder.skip((page - 1) * perPage).take(perPage);
    userQueryBuilder.orderBy('user.updatedAt', 'DESC');

    const [users, total] = await userQueryBuilder.getManyAndCount();

    return buildPaginationResponse(total, page, perPage, users);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    return buildSuccessResponse('User has been fetched successfully', { user });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    if(!user) {
      throw new NotFoundException(buildFailResponse(404, [ErrorMessages.USER.NOT_FOUND]));
    }

    if(updateUserDto.email && user.email != updateUserDto.email){
      const oldUserWithSameEmail = await this.userRepository.findOneBy({ email: updateUserDto.email });
      if(oldUserWithSameEmail) {
        throw new BadRequestException(buildFailResponse(400, [ErrorMessages.USER.EMAIL_EXISTS]));
      }
    }
    if(updateUserDto.phone && user.phone != updateUserDto.phone){
      const oldUserWithSamePhone = await this.userRepository.findOneBy({ phone: updateUserDto.phone });
      if(oldUserWithSamePhone) {
        throw new BadRequestException(buildFailResponse(400, [ErrorMessages.USER.PHONE_EXISTS]));
      }
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return buildSuccessResponse('User has been updated successfully', null);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if(!user) {
      throw new NotFoundException(buildFailResponse(404, [ErrorMessages.USER.NOT_FOUND]));
    }

    await this.userRepository.remove(user);

    return buildSuccessResponse('User has been deleted successfully', null);
  }
}
