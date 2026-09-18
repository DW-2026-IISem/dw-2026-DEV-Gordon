import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateEntregableDto {
  @ApiProperty({ example: 1, description: 'id de la tarea a la que pertenece el entregable' })
  @IsInt()
  @IsPositive()
  tareaId!: number;

  @ApiPropertyOptional({ example: 'Primer avance para revisión interna' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
