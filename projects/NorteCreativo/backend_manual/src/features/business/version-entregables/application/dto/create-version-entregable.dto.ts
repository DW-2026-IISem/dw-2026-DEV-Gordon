import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVersionEntregableDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'entregableId debe ser entero' })
  @Min(1, { message: 'entregableId es requerido' })
  entregableId!: number;

  @ApiPropertyOptional({ example: 'Versión corregida según comentarios del cliente' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
