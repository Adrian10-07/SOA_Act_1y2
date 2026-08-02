import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsIn,
  IsNumberString,
  Length,
} from 'class-validator';

/**
 * DTO para disparar la Saga completa
 * "forzarFalloConfirmacion=true" simula que el ultimo paso falla y activa las compensaciones.*/
export class IniciarSagaDto {
  @ApiProperty({ example: 'MAS-4501' })
  @IsString()
  @IsNotEmpty()
  mascotaId: string;

  @ApiProperty({ example: 'VET-07' })
  @IsString()
  @IsNotEmpty()
  veterinarioId: string;

  @ApiProperty({ example: '2026-08-05T10:30:00Z' })
  @IsDateString()
  fechaHora: string;

  @ApiProperty({ example: 'vacunaTriple', enum: ['vacunaTriple', 'vacunaAntirrabica'] })
  @IsIn(['vacunaTriple', 'vacunaAntirrabica'])
  vacuna: 'vacunaTriple' | 'vacunaAntirrabica';

  @ApiProperty({ example: '4242', description: 'Ultimos 4 digitos de la tarjeta. Usa "0000" para simular rechazo.' })
  @IsNumberString()
  @Length(4, 4)
  tarjetaTerminaEn: string;

  @ApiProperty({ example: false, description: 'Si es true, el paso final ConfirmarCita fallara.' })
  forzarFalloConfirmacion?: boolean;
}
