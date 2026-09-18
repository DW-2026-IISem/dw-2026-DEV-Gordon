import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTareaDto } from '../../application/dtos/create-tarea.dto.js';
import { TareaMapper } from '../../application/mappers/tarea.mapper.js';
import { CreateTareaUseCase } from '../../application/use-cases/create-tarea.use-case.js';
import { GetTareaByIdUseCase } from '../../application/use-cases/get-tarea-by-id.use-case.js';
import { ListTareasUseCase } from '../../application/use-cases/list-tareas.use-case.js';

@ApiTags('Tareas')
@Controller('tareas')
export class TareasController {
  constructor(
    private readonly createTareaUseCase: CreateTareaUseCase,
    private readonly listTareasUseCase: ListTareasUseCase,
    private readonly getTareaByIdUseCase: GetTareaByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista las tareas registradas' })
  @ApiOkResponse({ description: 'Listado de tareas' })
  async findAll() {
    const tareas = await this.listTareasUseCase.execute();
    const items = TareaMapper.toResponseList(tareas);

    return {
      items,
      meta: { total: items.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta una tarea por id' })
  @ApiOkResponse({ description: 'Tarea encontrada' })
  @ApiNotFoundResponse({ description: 'Tarea no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tarea = await this.getTareaByIdUseCase.execute(id);
    return TareaMapper.toResponse(tarea);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra una nueva tarea' })
  @ApiCreatedResponse({ description: 'Tarea creada' })
  @ApiNotFoundResponse({ description: 'El hito indicado no existe' })
  async create(@Body() dto: CreateTareaDto) {
    const tarea = await this.createTareaUseCase.execute(dto);
    return TareaMapper.toResponse(tarea);
  }
}
