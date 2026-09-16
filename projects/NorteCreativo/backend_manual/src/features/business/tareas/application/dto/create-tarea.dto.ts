import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTareaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'hitoId debe ser entero' })
  @Min(1, { message: 'hitoId es requerido' })
  hitoId!: number;

  @ApiProperty({ example: 'Diseñar post de Instagram' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Formato cuadrado, paleta de colores del carnaval' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
