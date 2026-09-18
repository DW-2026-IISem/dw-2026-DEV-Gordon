import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateCampaniaDto {
  @ApiProperty({ example: 1, description: 'id del cliente dueño de la campaña' })
  @IsInt()
  @IsPositive()
  clienteId!: number;

  @ApiProperty({ example: 'Carnaval 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Campaña de temporada para el Carnaval 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
