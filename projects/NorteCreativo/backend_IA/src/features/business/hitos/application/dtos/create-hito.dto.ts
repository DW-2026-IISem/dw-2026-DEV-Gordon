import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateHitoDto {
  @ApiProperty({ example: 1, description: 'id de la campaña a la que pertenece el hito' })
  @IsInt()
  @IsPositive()
  campaniaId!: number;

  @ApiProperty({ example: 'Diseño de piezas para redes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Piezas gráficas para Instagram y Facebook' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
