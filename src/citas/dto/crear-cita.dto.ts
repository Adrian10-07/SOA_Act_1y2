import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,IsNotEmpty,IsDateString,IsOptional,IsIn,MaxLength,Matches,} from 'class-validator';

/** DTO para la operacion crearCita (Tarea 2a).*/
export class CrearCitaDto {
  @ApiProperty({
    example: 'MAS-4501',
    description: 'Identificador de la mascota registrada en el sistema',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^MAS-\d{4,}$/, { message: 'Formato esperado: MAS-XXXX' })
  mascotaId: string;

  @ApiProperty({
    example: 'VET-07',
    description: 'Identificador del veterinario asignado',
  })
  @IsString()
  @IsNotEmpty()
  veterinarioId: string;

  @ApiProperty({
    example: '2026-08-05T10:30:00Z',
    description: 'Fecha y hora de la cita en formato ISO-8601',
  })
  @IsDateString()
  fechaHora: string;

  @ApiProperty({
    example: 'Vacunacion anual',
    description: 'Motivo breve de la consulta',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;

  @ApiProperty({
    example: 'web',
    enum: ['web', 'mostrador', 'telefono'],
    description: 'Canal por el que se agenda la cita',
  })
  @IsIn(['web', 'mostrador', 'telefono'])
  canal: 'web' | 'mostrador' | 'telefono';
}
