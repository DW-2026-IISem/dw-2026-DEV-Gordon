import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCampaniaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'clienteId debe ser entero' })
  @Min(1, { message: 'clienteId es requerido' })
  clienteId!: number;

  @ApiProperty({ example: 'Carnaval 2026' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Campaña de carnaval para redes y vallas' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
