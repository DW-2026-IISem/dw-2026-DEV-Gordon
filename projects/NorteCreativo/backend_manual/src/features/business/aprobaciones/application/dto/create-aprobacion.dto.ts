import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAprobacionDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'versionEntregableId debe ser entero' })
  @Min(1, { message: 'versionEntregableId es requerido' })
  versionEntregableId!: number;

  @ApiProperty({ example: 'APROBADA', enum: ['APROBADA', 'RECHAZADA'] })
  @IsIn(['APROBADA', 'RECHAZADA'], { message: 'estado debe ser APROBADA o RECHAZADA' })
  estado!: 'APROBADA' | 'RECHAZADA';

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'aprobadorId debe ser entero' })
  @Min(1, { message: 'aprobadorId es requerido' })
  aprobadorId!: number;

  @ApiPropertyOptional({ example: 'Aprobado, listo para publicar' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
