import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCampaniaDto } from '../../../application/dto/create-campania.dto.js';
import { CampaniaMapper } from '../../../application/mappers/campania.mapper.js';
import { CreateCampaniaUseCase } from '../../../application/use-cases/create-campania.use-case.js';
import { GetCampaniaByIdUseCase } from '../../../application/use-cases/get-campania-by-id.use-case.js';
import { ListCampaniasUseCase } from '../../../application/use-cases/list-campanias.use-case.js';

@ApiTags('campanias')
@Controller('campanias')
export class CampaniasController {
  constructor(
    private readonly createCampania: CreateCampaniaUseCase,
    private readonly listCampanias: ListCampaniasUseCase,
    private readonly getCampania: GetCampaniaByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear campaña' })
  async create(@Body() dto: CreateCampaniaDto) {
    const campania = await this.createCampania.execute(dto);
    return CampaniaMapper.toResponse(campania);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campañas (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listCampanias.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener campaña por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const campania = await this.getCampania.execute(id);
    return CampaniaMapper.toResponse(campania);
  }
}
