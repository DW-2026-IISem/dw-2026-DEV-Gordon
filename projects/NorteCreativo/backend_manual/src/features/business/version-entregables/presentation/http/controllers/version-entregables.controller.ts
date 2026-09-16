import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVersionEntregableDto } from '../../../application/dto/create-version-entregable.dto.js';
import { VersionEntregableMapper } from '../../../application/mappers/version-entregable.mapper.js';
import { CreateVersionEntregableUseCase } from '../../../application/use-cases/create-version-entregable.use-case.js';
import { GetVersionByIdUseCase } from '../../../application/use-cases/get-version-by-id.use-case.js';

@ApiTags('version-entregables')
@Controller('version-entregables')
export class VersionEntregablesController {
  constructor(
    private readonly createVersion: CreateVersionEntregableUseCase,
    private readonly getVersion: GetVersionByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear nueva versión de un entregable (numeroVersion automático)' })
  async create(@Body() dto: CreateVersionEntregableDto) {
    const version = await this.createVersion.execute(dto);
    return VersionEntregableMapper.toResponse(version);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener versión por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const version = await this.getVersion.execute(id);
    return VersionEntregableMapper.toResponse(version);
  }
}
