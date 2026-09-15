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
import { CreateClienteDto } from '../../../application/dto/create-cliente.dto.js';
import { ClienteMapper } from '../../../application/mappers/cliente.mapper.js';
import { CreateClienteUseCase } from '../../../application/use-cases/create-cliente.use-case.js';
import { GetClienteByIdUseCase } from '../../../application/use-cases/get-cliente-by-id.use-case.js';
import { ListClientesUseCase } from '../../../application/use-cases/list-clientes.use-case.js';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly createCliente: CreateClienteUseCase,
    private readonly listClientes: ListClientesUseCase,
    private readonly getCliente: GetClienteByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear cliente' })
  async create(@Body() dto: CreateClienteDto) {
    const cliente = await this.createCliente.execute(dto);
    return ClienteMapper.toResponse(cliente);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listClientes.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.getCliente.execute(id);
    return ClienteMapper.toResponse(cliente);
  }
}
