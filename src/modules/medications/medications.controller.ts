import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { MedicationService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IMedicationQuery } from './interfaces/medication-query.interface';

@Controller('medications')
@UseGuards(AuthGuard)
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  create(@Body() createMedicationDto: CreateMedicationDto, @Request() req: any) {
    return this.medicationService.create(createMedicationDto, req.user);
  }

  @Get()
  findAll(@Query() query: IMedicationQuery, @Request() req: any) {
    return this.medicationService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicationDto: UpdateMedicationDto, @Request() req: any) {
    return this.medicationService.update(+id, updateMedicationDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.medicationService.remove(+id, req.user);
  }
}
