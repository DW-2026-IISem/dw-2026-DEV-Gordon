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
import { CreateTareaDto } from '../../../application/dto/create-tarea.dto.js';
import { TareaMapper } from '../../../application/mappers/tarea.mapper.js';
import { CreateTareaUseCase } from '../../../application/use-cases/create-tarea.use-case.js';
import { GetTareaByIdUseCase } from '../../../application/use-cases/get-tarea-by-id.use-case.js';
import { ListTareasUseCase } from '../../../application/use-cases/list-tareas.use-case.js';

@ApiTags('tareas')
@Controller('tareas')
export class TareasController {
  constructor(
    private readonly createTarea: CreateTareaUseCase,
    private readonly listTareas: ListTareasUseCase,
    private readonly getTarea: GetTareaByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear tarea' })
  async create(@Body() dto: CreateTareaDto) {
    const tarea = await this.createTarea.execute(dto);
    return TareaMapper.toResponse(tarea);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listTareas.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tarea = await this.getTarea.execute(id);
    return TareaMapper.toResponse(tarea);
  }
}
