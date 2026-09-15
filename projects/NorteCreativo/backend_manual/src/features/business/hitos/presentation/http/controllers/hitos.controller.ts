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
import { CreateHitoDto } from '../../../application/dto/create-hito.dto.js';
import { HitoMapper } from '../../../application/mappers/hito.mapper.js';
import { CreateHitoUseCase } from '../../../application/use-cases/create-hito.use-case.js';
import { GetHitoByIdUseCase } from '../../../application/use-cases/get-hito-by-id.use-case.js';
import { ListHitosUseCase } from '../../../application/use-cases/list-hitos.use-case.js';

@ApiTags('hitos')
@Controller('hitos')
export class HitosController {
  constructor(
    private readonly createHito: CreateHitoUseCase,
    private readonly listHitos: ListHitosUseCase,
    private readonly getHito: GetHitoByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear hito' })
  async create(@Body() dto: CreateHitoDto) {
    const hito = await this.createHito.execute(dto);
    return HitoMapper.toResponse(hito);
  }

  @Get()
  @ApiOperation({ summary: 'Listar hitos (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listHitos.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener hito por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const hito = await this.getHito.execute(id);
    return HitoMapper.toResponse(hito);
  }
}
