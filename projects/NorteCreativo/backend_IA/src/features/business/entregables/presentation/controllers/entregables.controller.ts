import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEntregableDto } from '../../application/dtos/create-entregable.dto.js';
import { EntregableMapper } from '../../application/mappers/entregable.mapper.js';
import { CreateEntregableUseCase } from '../../application/use-cases/create-entregable.use-case.js';
import { GetEntregableByIdUseCase } from '../../application/use-cases/get-entregable-by-id.use-case.js';
import { ListEntregablesUseCase } from '../../application/use-cases/list-entregables.use-case.js';

@ApiTags('Entregables')
@Controller('entregables')
export class EntregablesController {
  constructor(
    private readonly createEntregableUseCase: CreateEntregableUseCase,
    private readonly listEntregablesUseCase: ListEntregablesUseCase,
    private readonly getEntregableByIdUseCase: GetEntregableByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista los entregables registrados' })
  @ApiOkResponse({ description: 'Listado de entregables' })
  async findAll() {
    const entregables = await this.listEntregablesUseCase.execute();
    const items = EntregableMapper.toResponseList(entregables);

    return {
      items,
      meta: { total: items.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta un entregable por id' })
  @ApiOkResponse({ description: 'Entregable encontrado' })
  @ApiNotFoundResponse({ description: 'Entregable no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entregable = await this.getEntregableByIdUseCase.execute(id);
    return EntregableMapper.toResponse(entregable);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra un nuevo entregable' })
  @ApiCreatedResponse({ description: 'Entregable creado' })
  @ApiNotFoundResponse({ description: 'La tarea indicada no existe' })
  async create(@Body() dto: CreateEntregableDto) {
    const entregable = await this.createEntregableUseCase.execute(dto);
    return EntregableMapper.toResponse(entregable);
  }
}
