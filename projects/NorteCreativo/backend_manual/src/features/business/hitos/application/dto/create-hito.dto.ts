import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateHitoDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'campaniaId debe ser entero' })
  @Min(1, { message: 'campaniaId es requerido' })
  campaniaId!: number;

  @ApiProperty({ example: 'Piezas para redes sociales' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Diseño de post e historias para Instagram' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
