import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAprobacionDto } from '../../../application/dto/create-aprobacion.dto.js';
import { AprobacionMapper } from '../../../application/mappers/aprobacion.mapper.js';
import { GetAprobacionByIdUseCase } from '../../../application/use-cases/get-aprobacion-by-id.use-case.js';
import { RegistrarAprobacionUseCase } from '../../../application/use-cases/registrar-aprobacion.use-case.js';

@ApiTags('aprobaciones')
@Controller('aprobaciones')
export class AprobacionesController {
  constructor(
    private readonly registrarAprobacion: RegistrarAprobacionUseCase,
    private readonly getAprobacion: GetAprobacionByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registrar aprobación o rechazo (cierra el hito automáticamente si es la última pendiente)',
  })
  async create(@Body() dto: CreateAprobacionDto) {
    const resultado = await this.registrarAprobacion.execute(dto);
    return AprobacionMapper.toResponse(resultado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener aprobación por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getAprobacion.execute(id);
  }
}
