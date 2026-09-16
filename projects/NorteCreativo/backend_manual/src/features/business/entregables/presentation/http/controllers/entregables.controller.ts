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
import { CreateEntregableDto } from '../../../application/dto/create-entregable.dto.js';
import { EntregableMapper } from '../../../application/mappers/entregable.mapper.js';
import { CreateEntregableUseCase } from '../../../application/use-cases/create-entregable.use-case.js';
import { GetEntregableByIdUseCase } from '../../../application/use-cases/get-entregable-by-id.use-case.js';
import { ListEntregablesUseCase } from '../../../application/use-cases/list-entregables.use-case.js';

@ApiTags('entregables')
@Controller('entregables')
export class EntregablesController {
  constructor(
    private readonly createEntregable: CreateEntregableUseCase,
    private readonly listEntregables: ListEntregablesUseCase,
    private readonly getEntregable: GetEntregableByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear entregable' })
  async create(@Body() dto: CreateEntregableDto) {
    const entregable = await this.createEntregable.execute(dto);
    return EntregableMapper.toResponse(entregable);
  }

  @Get()
  @ApiOperation({ summary: 'Listar entregables (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listEntregables.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener entregable por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entregable = await this.getEntregable.execute(id);
    return EntregableMapper.toResponse(entregable);
  }
}
