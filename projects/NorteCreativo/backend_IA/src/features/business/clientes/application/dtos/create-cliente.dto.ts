import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TIPOS_DOCUMENTO_CLIENTE, type TipoDocumentoCliente } from '../../domain/entities/cliente.entity.js';

export class CreateClienteDto {
  @ApiProperty({ enum: TIPOS_DOCUMENTO_CLIENTE, example: 'NIT' })
  @IsIn(TIPOS_DOCUMENTO_CLIENTE)
  tipoDocumento!: TipoDocumentoCliente;

  @ApiProperty({ example: '890900943-9' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numeroDocumento!: string;

  @ApiProperty({ example: 'Postobón S.A.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: '+57 604 3391000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@postobon.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
