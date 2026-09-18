import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateVersionEntregableDto {
  @ApiProperty({ example: 1, description: 'id del entregable al que pertenece la versión' })
  @IsInt()
  @IsPositive()
  entregableId!: number;

  @ApiPropertyOptional({ example: 'Ajustes de color solicitados por el cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
