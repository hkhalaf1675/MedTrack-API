import { Module } from '@nestjs/common';
import { MedicationService } from './medications.service';
import { MedicationController } from './medications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Medication } from './entities/medication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Medication])
  ],
  controllers: [MedicationController],
  providers: [MedicationService],
})
export class MedicationModule {}
