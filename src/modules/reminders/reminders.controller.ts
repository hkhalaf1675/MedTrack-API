import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { IReminderQuery } from './interfaces/reminder-query.interface';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('reminders')
@UseGuards(AuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll(@Query() query: IReminderQuery, @Request() req: any) {
    return this.remindersService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.remindersService.findOne(+id);
  }

  @Patch(':id/mark-taken')
  updateStatus(@Param('id') id: string, @Request() req: any){
    return this.remindersService.updateStatus(+id, req.user);
  }
}
