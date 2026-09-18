import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

const ESTADOS_APROBACION_DTO = ['APROBADA', 'RECHAZADA'] as const;

export class CreateAprobacionDto {
  @ApiProperty({ example: 1, description: 'id de la versión de entregable que se aprueba o rechaza' })
  @IsInt()
  @IsPositive()
  versionEntregableId!: number;

  @ApiProperty({ enum: ESTADOS_APROBACION_DTO, example: 'APROBADA' })
  @IsIn(ESTADOS_APROBACION_DTO)
  estado!: (typeof ESTADOS_APROBACION_DTO)[number];

  @ApiProperty({ example: 1, description: 'id de quien aprueba (sin validación de rol en esta fase)' })
  @IsInt()
  @IsPositive()
  aprobadorId!: number;

  @ApiPropertyOptional({ example: 'Se aprueba sin observaciones' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}
