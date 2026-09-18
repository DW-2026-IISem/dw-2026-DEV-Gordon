import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVersionEntregableDto } from '../../application/dtos/create-version-entregable.dto.js';
import { VersionEntregableMapper } from '../../application/mappers/version-entregable.mapper.js';
import { CreateVersionEntregableUseCase } from '../../application/use-cases/create-version-entregable.use-case.js';
import { GetVersionByIdUseCase } from '../../application/use-cases/get-version-by-id.use-case.js';

@ApiTags('Versiones de entregable')
@Controller('version-entregables')
export class VersionEntregablesController {
  constructor(
    private readonly createVersionEntregableUseCase: CreateVersionEntregableUseCase,
    private readonly getVersionByIdUseCase: GetVersionByIdUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Consulta una versión de entregable por id' })
  @ApiOkResponse({ description: 'Versión encontrada' })
  @ApiNotFoundResponse({ description: 'Versión no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const version = await this.getVersionByIdUseCase.execute(id);
    return VersionEntregableMapper.toResponse(version);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra una nueva versión de un entregable (numeroVersion es automático)' })
  @ApiCreatedResponse({ description: 'Versión creada' })
  @ApiNotFoundResponse({ description: 'El entregable indicado no existe' })
  async create(@Body() dto: CreateVersionEntregableDto) {
    const version = await this.createVersionEntregableUseCase.execute(dto);
    return VersionEntregableMapper.toResponse(version);
  }
}
