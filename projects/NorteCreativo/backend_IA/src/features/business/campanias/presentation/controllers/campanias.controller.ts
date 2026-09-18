import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCampaniaDto } from '../../application/dtos/create-campania.dto.js';
import { CampaniaMapper } from '../../application/mappers/campania.mapper.js';
import { CreateCampaniaUseCase } from '../../application/use-cases/create-campania.use-case.js';
import { GetCampaniaByIdUseCase } from '../../application/use-cases/get-campania-by-id.use-case.js';
import { ListCampaniasUseCase } from '../../application/use-cases/list-campanias.use-case.js';

@ApiTags('Campañas')
@Controller('campanias')
export class CampaniasController {
  constructor(
    private readonly createCampaniaUseCase: CreateCampaniaUseCase,
    private readonly listCampaniasUseCase: ListCampaniasUseCase,
    private readonly getCampaniaByIdUseCase: GetCampaniaByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista las campañas registradas' })
  @ApiOkResponse({ description: 'Listado de campañas' })
  async findAll() {
    const campanias = await this.listCampaniasUseCase.execute();
    const items = CampaniaMapper.toResponseList(campanias);

    return {
      items,
      meta: { total: items.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta una campaña por id' })
  @ApiOkResponse({ description: 'Campaña encontrada' })
  @ApiNotFoundResponse({ description: 'Campaña no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const campania = await this.getCampaniaByIdUseCase.execute(id);
    return CampaniaMapper.toResponse(campania);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra una nueva campaña' })
  @ApiCreatedResponse({ description: 'Campaña creada' })
  @ApiNotFoundResponse({ description: 'El cliente indicado no existe' })
  async create(@Body() dto: CreateCampaniaDto) {
    const campania = await this.createCampaniaUseCase.execute(dto);
    return CampaniaMapper.toResponse(campania);
  }
}
