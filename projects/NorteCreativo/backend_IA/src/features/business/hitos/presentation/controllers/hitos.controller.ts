import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateHitoDto } from '../../application/dtos/create-hito.dto.js';
import { HitoMapper } from '../../application/mappers/hito.mapper.js';
import { CreateHitoUseCase } from '../../application/use-cases/create-hito.use-case.js';
import { GetHitoByIdUseCase } from '../../application/use-cases/get-hito-by-id.use-case.js';
import { ListHitosUseCase } from '../../application/use-cases/list-hitos.use-case.js';

@ApiTags('Hitos')
@Controller('hitos')
export class HitosController {
  constructor(
    private readonly createHitoUseCase: CreateHitoUseCase,
    private readonly listHitosUseCase: ListHitosUseCase,
    private readonly getHitoByIdUseCase: GetHitoByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista los hitos registrados' })
  @ApiOkResponse({ description: 'Listado de hitos' })
  async findAll() {
    const hitos = await this.listHitosUseCase.execute();
    const items = HitoMapper.toResponseList(hitos);

    return {
      items,
      meta: { total: items.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta un hito por id' })
  @ApiOkResponse({ description: 'Hito encontrado' })
  @ApiNotFoundResponse({ description: 'Hito no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const hito = await this.getHitoByIdUseCase.execute(id);
    return HitoMapper.toResponse(hito);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra un nuevo hito (queda en estado ABIERTO)' })
  @ApiCreatedResponse({ description: 'Hito creado' })
  @ApiNotFoundResponse({ description: 'La campaña indicada no existe' })
  async create(@Body() dto: CreateHitoDto) {
    const hito = await this.createHitoUseCase.execute(dto);
    return HitoMapper.toResponse(hito);
  }
}
