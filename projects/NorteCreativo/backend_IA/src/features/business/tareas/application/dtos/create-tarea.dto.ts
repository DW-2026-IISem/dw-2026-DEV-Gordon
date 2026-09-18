import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateTareaDto {
  @ApiProperty({ example: 1, description: 'id del hito al que pertenece la tarea' })
  @IsInt()
  @IsPositive()
  hitoId!: number;

  @ApiProperty({ example: 'Diseñar arte para post de Instagram' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Formato 1080x1350, paleta de marca' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
