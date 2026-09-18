import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateClienteDto } from '../../application/dtos/create-cliente.dto.js';
import { ClienteMapper } from '../../application/mappers/cliente.mapper.js';
import { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case.js';
import { GetClienteByIdUseCase } from '../../application/use-cases/get-cliente-by-id.use-case.js';
import { ListClientesUseCase } from '../../application/use-cases/list-clientes.use-case.js';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly listClientesUseCase: ListClientesUseCase,
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista los clientes registrados' })
  @ApiOkResponse({ description: 'Listado de clientes' })
  async findAll() {
    const clientes = await this.listClientesUseCase.execute();
    const items = ClienteMapper.toResponseList(clientes);

    return {
      items,
      meta: { total: items.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta un cliente por id' })
  @ApiOkResponse({ description: 'Cliente encontrado' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.getClienteByIdUseCase.execute(id);
    return ClienteMapper.toResponse(cliente);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra un nuevo cliente' })
  @ApiCreatedResponse({ description: 'Cliente creado' })
  async create(@Body() dto: CreateClienteDto) {
    const cliente = await this.createClienteUseCase.execute(dto);
    return ClienteMapper.toResponse(cliente);
  }
}
