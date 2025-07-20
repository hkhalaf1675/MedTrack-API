import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateMedicationDto, MedicationRepeat } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { buildFailResponse, buildPaginationResponse, buildSuccessResponse } from '../../common/utils/api-response';
import { ErrorMessages } from '../../common/constants/error-messages';
import { IMedicationQuery } from './interfaces/medication-query.interface';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>
  ) {}

  async create(createMedicationDto: CreateMedicationDto, user: User) {
    let assignedUser = user;
    if(createMedicationDto.userId){
      const enteredUser = await this.userRepository.findOneBy({ id: createMedicationDto.userId });

      if(!enteredUser){
        throw new BadRequestException(buildFailResponse(400, [ErrorMessages.USER.NOT_FOUND]));
      }
      this.ensureUserAuthorization(enteredUser);

      assignedUser = enteredUser;
    }
    else {
      this.ensureUserAuthorization(user);
    }

    const oldMedication = await this.medicationRepository.findOne({
      where: {
        user: { id: assignedUser.id },
        name: createMedicationDto.name
      }
    });

    if(oldMedication){
      throw new BadRequestException(buildFailResponse(400, [ErrorMessages.MEDICATION.MEDICATION_ADDED_BEFORE]));
    }

    let repeat: string = this.formatRepeat(createMedicationDto.repeat, createMedicationDto.interval);

    const medication = this.medicationRepository.create({
      ...createMedicationDto,
      user: assignedUser,
      repeat
    });

    await this.medicationRepository.save(medication);

    return buildSuccessResponse('Medication has been added successfully', { medication });
  }

  async findAll(query: IMedicationQuery, user: User) {
    let { page = 1, perPage = 10, name, userId } = query;

    const queryBuilder = this.medicationRepository.createQueryBuilder('medication');

    queryBuilder.where('medication.userId = :userId', { userId: userId ? userId : user.id });

    if(name){
      queryBuilder.andWhere('medication.name LIKE :name', { name: `%${name}%` });
    }

    queryBuilder.skip((page - 1) * perPage).take(perPage);
    queryBuilder.orderBy('medication.id', 'DESC');
    
    const [medications, total] = await queryBuilder.getManyAndCount();

    return buildPaginationResponse(total, page, perPage, medications);
  }

  async findOne(id: number) {
    const medication = await this.medicationRepository.findOne({
      where: { id },
      relations: { user: true }
    });

    return buildSuccessResponse('Medication has been fetched Successfully', { medication });
  }

  async update(id: number, updateMedicationDto: UpdateMedicationDto, user: User) {
    const medication = await this.findMedicationOrThrow(id);

    if(updateMedicationDto.userId && medication?.user.id != updateMedicationDto.userId){
      throw new BadRequestException(buildFailResponse(400, [ErrorMessages.MEDICATION.CAN_NOT_UPDATE_ASSIGNED]));
    }

    this.ensureUserAuthorization(user, medication.user.id);

    Object.assign(medication, updateMedicationDto);

    medication.repeat = updateMedicationDto.repeat && this.formatRepeat(updateMedicationDto.repeat, updateMedicationDto.interval);

    await this.medicationRepository.save(medication);

    return buildSuccessResponse('Medication has been updated successfully', { medication });
  }

  async remove(id: number, user: User) {
    const medication = await this.findMedicationOrThrow(id);

    this.ensureUserAuthorization(user, medication.user.id);
    
    await this.medicationRepository.remove(medication);

    return buildSuccessResponse('Medication has been removed successfully', {  });
  }

  private formatRepeat(repeat: string, interval?: number){
    if(repeat === MedicationRepeat.EVERY_X_DAYS){
      return `every_${interval ?? 1}_days`;
    }
    return repeat;
  }

  private async findMedicationOrThrow(id: number){
    const medication = await this.medicationRepository.findOne({
      where: { id },
      relations: {
        user: true
      }
    });
    if(!medication){
      throw new NotFoundException(buildFailResponse(404, [ErrorMessages.MEDICATION.NOT_FOUND]));
    }
    return medication;
  }

  private ensureUserAuthorization(user: User, medicationUserId?: number){
    if(medicationUserId){
      if(user.id !== medicationUserId && user.role === UserRole.PATIENT){
        throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.UNAUTHORIZED]));
      }
    }
    else {
      if(user.role !== UserRole.PATIENT){
        throw new BadRequestException(buildFailResponse(400, [ErrorMessages.MEDICATION.NOT_PATIENT]));
      }
    }
    return true;
  }
}
