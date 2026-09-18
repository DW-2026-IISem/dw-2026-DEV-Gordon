import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAprobacionDto } from '../../application/dtos/create-aprobacion.dto.js';
import { AprobacionMapper } from '../../application/mappers/aprobacion.mapper.js';
import { GetAprobacionByIdUseCase } from '../../application/use-cases/get-aprobacion-by-id.use-case.js';
import { RegistrarAprobacionUseCase } from '../../application/use-cases/registrar-aprobacion.use-case.js';

@ApiTags('Aprobaciones')
@Controller('aprobaciones')
export class AprobacionesController {
  constructor(
    private readonly registrarAprobacionUseCase: RegistrarAprobacionUseCase,
    private readonly getAprobacionByIdUseCase: GetAprobacionByIdUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Consulta una aprobación por id' })
  @ApiOkResponse({ description: 'Aprobación encontrada' })
  @ApiNotFoundResponse({ description: 'Aprobación no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const aprobacion = await this.getAprobacionByIdUseCase.execute(id);
    return AprobacionMapper.toResponse(aprobacion);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registra la aprobación o el rechazo de una versión de entregable',
    description:
      'Si el estado es APROBADA y todos los entregables del hito quedan con su última versión APROBADA, el hito se cierra automáticamente dentro de la misma transacción.',
  })
  @ApiCreatedResponse({ description: 'Aprobación registrada (incluye hitoCerrado, hitoId y fechaCierre)' })
  @ApiNotFoundResponse({ description: 'La versión de entregable indicada no existe' })
  @ApiConflictResponse({ description: 'El hito de esa versión ya no está ABIERTO' })
  async create(@Body() dto: CreateAprobacionDto) {
    const resultado = await this.registrarAprobacionUseCase.execute(dto);
    return AprobacionMapper.toRegistrarResponse(resultado);
  }
}
