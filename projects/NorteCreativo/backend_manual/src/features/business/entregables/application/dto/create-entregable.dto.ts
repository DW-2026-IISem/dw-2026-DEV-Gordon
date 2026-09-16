import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEntregableDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'tareaId debe ser entero' })
  @Min(1, { message: 'tareaId es requerido' })
  tareaId!: number;

  @ApiPropertyOptional({ example: 'Primer borrador subido para revisión' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
