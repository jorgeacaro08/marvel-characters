import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamsService } from './teams.service.js';
import { AssignDto, TeamDto } from './team.dto.js';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Get(':id/characters')
  findCharacters(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findCharacters(id);
  }

  @Post()
  create(@Body() dto: TeamDto) {
    return this.teamsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: TeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Patch(':id/characters')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignDto) {
    return this.teamsService.assign(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.remove(id);
  }
}
