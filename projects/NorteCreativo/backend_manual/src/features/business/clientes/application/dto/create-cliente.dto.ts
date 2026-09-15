import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'NIT' })
  @IsString()
  @IsNotEmpty({ message: 'tipoDocumento es requerido' })
  @MaxLength(20)
  tipoDocumento!: string;

  @ApiProperty({ example: '900123456-7' })
  @IsString()
  @IsNotEmpty({ message: 'numeroDocumento es requerido' })
  @MaxLength(30)
  numeroDocumento!: string;

  @ApiProperty({ example: 'Postobón S.A.' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@postobon.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email debe ser un correo válido' })
  @MaxLength(150)
  email?: string;
}
